"""Assist asks the house: the service `accurona.ask` and the intent `AccuronaAsk`.

A sentence said to Assist (a voice satellite, the Assist dialog, an automation) is handed to the open Accurona
views: the first one that understands it answers, shows the place and, when asked to, speaks. The sentences
Assist recognises come from `custom_sentences/<lang>/accurona.yaml`, which is written on setup (German and
English, only when it changed); the user may add their own sentences to the same intent in another file.
"""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from typing import Any, ClassVar
import uuid

from homeassistant.core import HomeAssistant, ServiceCall, ServiceResponse, SupportsResponse
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import intent
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.storage import Store
import voluptuous as vol

from .const import DATA_ASK, DATA_VOICE, DOMAIN, SIGNAL_ASK, STORAGE_KEY_VOICE

_LOGGER = logging.getLogger(__name__)

SERVICE_ASK = "ask"
INTENT_ASK = "AccuronaAsk"
# a view answers within a moment; a voice satellite waits for Assist, so the wait stays short
ANSWER_TIMEOUT = 6.0
SENTENCES_FILE = "accurona.yaml"

ASK_SCHEMA = vol.Schema(
    {
        vol.Required("text"): vol.All(cv.string, vol.Length(min=1, max=300)),
        vol.Optional("screen"): vol.All(cv.string, vol.Length(max=60)),
        vol.Optional("speak", default=False): cv.boolean,
    }
)

# what Assist says when no view answers, by the language of Home Assistant
_NO_SCREEN = {
    "de": "Kein Accurona-Bildschirm ist gerade offen.",
    "en": "No Accurona screen is open right now.",
}
_NOT_UNDERSTOOD = {
    "de": "Das hat Accurona nicht verstanden.",
    "en": "Accurona did not understand that.",
}

# which sentences Assist hands to Accurona: only the distinct ones (default), every question, or none at all
SENTENCE_MODES = ("distinct", "all", "off")
DEFAULT_SENTENCE_MODE = "distinct"

# the distinct sentences: nobody says them to Home Assistant itself, so they never take a sentence meant for it
_DISTINCT = {
    "de": [
        "zeig[e] [mir] [mal] [bitte] {text}",
        "geh[e] [mal] (in|ins|in die|in den|auf|aufs|auf die|auf den|zu|zum|zur) {text}",
        "(frag|frage) das haus {text}",
        "(haus|accurona|neon plan) {text}",
        "gute nacht",
        "guten morgen",
        "was kannst du [alles]",
    ],
    "en": [
        "show [me] {text}",
        "go to [the] {text}",
        "ask the house {text}",
        "(house|accurona|neon plan) {text}",
        "good night",
        "good morning",
        "what can you do",
    ],
}

# the questions: handy, but some of them Home Assistant answers itself ("which windows are open", #641), so
# they go to Accurona only with the setting "all"
_QUESTIONS = {
    "de": [
        "wo (ist|sind|steht|stehen) {text}",
        "was ist [alles|gerade|denn] offen",
        "ist [irgend]was offen",
        "welche (fenster|türen) sind [noch] offen",
        "ist (ein|das) fenster (im|in der|in dem|auf dem|auf der) {text} offen",
        "wo ist es (kalt|warm|zu kalt|zu warm)",
        "was (zieht|verbraucht|braucht) [gerade|denn] [den] strom",
        "was macht die (solaranlage|solar|pv|pv-anlage|photovoltaik)",
        "wie voll ist (der|die) (akku|batterie|speicher)",
        "sind die (rollläden|rolläden|jalousien|rollos) (unten|oben|zu|offen)",
        "ist (die|das) {text} (abgeschlossen|verschlossen|zu|offen|an|aus|ein)",
        "läuft (die|der|das) {text}",
        "was läuft [gerade|noch|alles]",
        "was (steht|ist) heute an",
        "wie (ist|wird) das wetter [heute|morgen]",
    ],
    "en": [
        "where (is|are) [the] {text}",
        "what is open",
        "is anything open",
        "which (windows|doors) are [still] open",
        "is a window open in the {text}",
        "where is it (cold|warm|too cold|too warm)",
        "what is (drawing|using) power",
        "what is the solar doing",
        "how full is the battery",
        "are the (blinds|shutters) (down|up|closed|open)",
        "is the {text} (locked|unlocked|closed|open|on|off)",
        "is the {text} running",
        "what is running",
        "what is on today",
        "what is the weather [like] [today|tomorrow]",
    ],
}


def sentences_of(language: str, mode: str = DEFAULT_SENTENCE_MODE) -> list[str]:
    """The sentences of a language in a mode (none for "off")."""
    if mode == "off":
        return []
    return _DISTINCT[language] + (_QUESTIONS[language] if mode == "all" else [])


def sentences_yaml(language: str, mode: str = DEFAULT_SENTENCE_MODE) -> str:
    """The custom sentences file of a language (written by hand: the file stays readable for the user)."""
    lines = [
        "# Written by Accurona: the sentences Assist hands to the open Accurona views (the first one that",
        "# understands answers). Rewritten on every start: put your own sentences for AccuronaAsk into another file.",
        "# Which sentences stand here is set in the editor: ⚙ Settings → Voice control → Sentences for Assist.",
        f'language: "{language}"',
        "intents:",
        f"  {INTENT_ASK}:",
        "    data:",
        "      - sentences:",
    ]
    lines += [f'          - "{s}"' for s in sentences_of(language, mode)]
    lines += ["lists:", "  text:", "    wildcard: true", ""]
    return "\n".join(lines)


def write_sentences(config_dir: Path, mode: str = DEFAULT_SENTENCE_MODE) -> bool:
    """Writes the sentence files (or removes them for "off"); True when any changed (Assist then reloads)."""
    changed = False
    for language in _DISTINCT:
        path = config_dir / "custom_sentences" / language / SENTENCES_FILE
        if mode == "off":
            if path.is_file():
                path.unlink()
                changed = True
            continue
        text = sentences_yaml(language, mode)
        try:
            if path.read_text(encoding="utf-8") == text:
                continue
        except OSError:
            pass
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        changed = True
    return changed


class VoiceSettings:
    """The voice settings of the installation (.storage/accurona.voice): which sentences Assist hands on."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._store: Store[dict[str, Any]] = Store(hass, 1, STORAGE_KEY_VOICE)
        self.sentences = DEFAULT_SENTENCE_MODE

    async def async_load(self) -> None:
        data = await self._store.async_load()
        mode = (data or {}).get("sentences")
        if mode in SENTENCE_MODES:
            self.sentences = mode

    async def async_set_sentences(self, mode: str) -> bool:
        """Sets the mode, rewrites the sentence files and tells Assist; True when the files changed."""
        if mode not in SENTENCE_MODES:
            raise ValueError(mode)
        self.sentences = mode
        await self._store.async_save({"sentences": mode})
        return await async_write_sentences(self.hass, mode)


async def async_write_sentences(hass: HomeAssistant, mode: str) -> bool:
    """Writes the sentence files for a mode and has Assist reload them when they changed."""
    try:
        changed = await hass.async_add_executor_job(write_sentences, Path(hass.config.config_dir), mode)
    except OSError:
        _LOGGER.debug("Could not write the Assist sentences", exc_info=True)
        return False
    # Assist reads custom sentences at its start: a changed file is loaded now (the service is there once it runs)
    if changed and hass.services.has_service("conversation", "reload"):
        await hass.services.async_call("conversation", "reload", {}, blocking=False)
    return changed


class AskBroker:
    """Hands a sentence to the views and waits for the first answer."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._pending: dict[str, asyncio.Future[dict[str, Any]]] = {}

    async def ask(self, text: str, screen: str | None, speak: bool) -> dict[str, Any] | None:
        """The answer of the first view ({"text", "answered"}), None when no view is open or none answered in time."""
        ask_id = uuid.uuid4().hex
        future: asyncio.Future[dict[str, Any]] = self.hass.loop.create_future()
        self._pending[ask_id] = future
        try:
            ask = {"ask_id": ask_id, "text": text, "screen": screen, "speak": speak}
            async_dispatcher_send(self.hass, SIGNAL_ASK, ask)
            async with asyncio.timeout(ANSWER_TIMEOUT):
                return await future
        except TimeoutError:
            return None
        finally:
            self._pending.pop(ask_id, None)

    def answer(self, ask_id: str, text: str, answered: bool) -> bool:
        """A view's answer; only the first one counts. False when the question is unknown (or answered already)."""
        future = self._pending.get(ask_id)
        if future is None or future.done():
            return False
        future.set_result({"text": text, "answered": answered})
        return True


class AskIntentHandler(intent.IntentHandler):
    """Assist's "show me the living room" and the questions the modules answer."""

    intent_type = INTENT_ASK
    description = "Shows a place or device in Accurona or asks the house a question (the open Accurona views answer)"
    slot_schema: ClassVar[dict] = {vol.Optional("text"): cv.string}

    def __init__(self, broker: AskBroker) -> None:
        self.broker = broker

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        slots = self.async_validate_slots(intent_obj.slots)
        # the views understand the whole sentence ("show the living room"); the wildcard alone is the fallback
        text = (intent_obj.text_input or str(slots.get("text", {}).get("value") or "")).strip()
        if not text:
            raise intent.InvalidSlotInfo("no sentence")
        language = (intent_obj.language or intent_obj.hass.config.language or "en").split("-")[0]
        answer = await self.broker.ask(text, None, False)
        response = intent_obj.create_response()
        if answer is None:
            response.async_set_speech(_NO_SCREEN.get(language, _NO_SCREEN["en"]))
        elif not answer["answered"]:
            response.async_set_speech(_NOT_UNDERSTOOD.get(language, _NOT_UNDERSTOOD["en"]))
        else:
            response.async_set_speech(answer["text"])
        return response


async def async_setup_voice(hass: HomeAssistant) -> None:
    """Registers the service and the intent and writes the sentences Assist understands."""
    broker = AskBroker(hass)
    hass.data[DATA_ASK] = broker

    async def handle_ask(call: ServiceCall) -> ServiceResponse:
        answer = await broker.ask(call.data["text"], call.data.get("screen"), call.data["speak"])
        if answer is None:
            return {"answered": False, "answer": "", "screen_open": False}
        return {"answered": answer["answered"], "answer": answer["text"], "screen_open": True}

    hass.services.async_register(
        DOMAIN, SERVICE_ASK, handle_ask, schema=ASK_SCHEMA, supports_response=SupportsResponse.OPTIONAL
    )
    intent.async_register(hass, AskIntentHandler(broker))

    settings = VoiceSettings(hass)
    await settings.async_load()
    hass.data[DATA_VOICE] = settings
    await async_write_sentences(hass, settings.sentences)


def async_unload_voice(hass: HomeAssistant) -> None:
    """Service and intent go with the integration."""
    hass.services.async_remove(DOMAIN, SERVICE_ASK)
    intent.async_remove(hass, INTENT_ASK)
    hass.data.pop(DATA_ASK, None)
    hass.data.pop(DATA_VOICE, None)
