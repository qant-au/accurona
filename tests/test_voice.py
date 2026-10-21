"""Assist asks the house: service, intent, sentences and the views' answers."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import patch

from homeassistant.core import HomeAssistant
from homeassistant.helpers import intent

from custom_components.accurona.const import DOMAIN
from custom_components.accurona.voice import sentences_yaml, write_sentences

from .test_init import _setup


async def _view(hass_ws_client, hass: HomeAssistant):
    """An open Accurona view: subscribed to the sentences."""
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": "accurona/voice/subscribe"})
    assert (await client.receive_json())["success"]
    return client


async def test_service_hands_the_sentence_to_the_views_and_returns_the_first_answer(
    hass: HomeAssistant, hass_ws_client
) -> None:
    await _setup(hass)
    view = await _view(hass_ws_client, hass)
    other = await _view(hass_ws_client, hass)

    task = hass.async_create_task(
        hass.services.async_call(
            DOMAIN, "ask", {"text": "Zeig das Wohnzimmer", "speak": True}, blocking=True, return_response=True
        )
    )
    ask = (await view.receive_json())["event"]
    assert ask["text"] == "Zeig das Wohnzimmer"
    assert ask["speak"] is True
    assert ask["screen"] is None
    assert (await other.receive_json())["event"]["ask_id"] == ask["ask_id"]

    await view.send_json(
        {"id": 2, "type": "accurona/voice/answer", "ask_id": ask["ask_id"], "text": "Ich zeige das Wohnzimmer."}
    )
    assert (await view.receive_json())["result"] == {"taken": True}
    # the second view is late
    await other.send_json({"id": 2, "type": "accurona/voice/answer", "ask_id": ask["ask_id"], "text": "Wohnzimmer"})
    assert (await other.receive_json())["result"] == {"taken": False}

    assert await task == {"answered": True, "answer": "Ich zeige das Wohnzimmer.", "screen_open": True}


async def test_service_without_an_open_view_says_so(hass: HomeAssistant) -> None:
    await _setup(hass)
    with patch("custom_components.accurona.voice.ANSWER_TIMEOUT", 0.05):
        result = await hass.services.async_call(
            DOMAIN, "ask", {"text": "Zeig die Küche", "screen": "Flur"}, blocking=True, return_response=True
        )
    assert result == {"answered": False, "answer": "", "screen_open": False}


async def test_intent_speaks_the_answer_or_that_nothing_was_understood(hass: HomeAssistant, hass_ws_client) -> None:
    await _setup(hass)
    view = await _view(hass_ws_client, hass)

    ids = iter(range(10, 100))

    async def answer(text: str, answered: bool) -> intent.IntentResponse:
        task = hass.async_create_task(
            intent.async_handle(hass, "test", "AccuronaAsk", {"text": {"value": text}}, text_input=text, language="de")
        )
        ask = (await view.receive_json())["event"]
        assert ask["text"] == text
        await view.send_json(
            {
                "id": next(ids),
                "type": "accurona/voice/answer",
                "ask_id": ask["ask_id"],
                "text": "Drei Fenster sind offen.",
                "answered": answered,
            }
        )
        await view.receive_json()
        return await task

    assert (await answer("Was ist offen", True)).speech["plain"]["speech"] == "Drei Fenster sind offen."
    assert (await answer("Blubb", False)).speech["plain"]["speech"] == "Das hat Accurona nicht verstanden."


async def test_intent_without_a_view(hass: HomeAssistant) -> None:
    await _setup(hass)
    with patch("custom_components.accurona.voice.ANSWER_TIMEOUT", 0.05):
        response = await intent.async_handle(
            hass, "test", "AccuronaAsk", {"text": {"value": "living room"}}, language="en"
        )
    assert response.speech["plain"]["speech"] == "No Accurona screen is open right now."


def test_sentences_are_written_once_and_rewritten_when_they_change(tmp_path: Path) -> None:
    assert write_sentences(tmp_path) is True
    de = tmp_path / "custom_sentences" / "de" / "accurona.yaml"
    text = de.read_text(encoding="utf-8")
    assert text == sentences_yaml("de")
    assert "zeig[e] [mir] [mal] [bitte] {text}" in text
    # by default only the distinct sentences: a question Home Assistant answers itself is not taken (#641)
    assert "welche (fenster|türen) sind [noch] offen" not in text
    assert "wo (ist|sind|steht|stehen) {text}" not in text
    assert (tmp_path / "custom_sentences" / "en" / "accurona.yaml").is_file()
    # unchanged: nothing written, no reload
    assert write_sentences(tmp_path) is False
    de.write_text("old", encoding="utf-8")
    assert write_sentences(tmp_path) is True
    # "all" adds the questions, "off" removes the files
    assert write_sentences(tmp_path, "all") is True
    assert "welche (fenster|türen) sind [noch] offen" in de.read_text(encoding="utf-8")
    assert write_sentences(tmp_path, "off") is True
    assert not de.exists()
    assert write_sentences(tmp_path, "off") is False


async def test_unload_removes_service_and_intent(hass: HomeAssistant) -> None:
    entry = await _setup(hass)
    assert hass.services.has_service(DOMAIN, "ask")
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert not hass.services.has_service(DOMAIN, "ask")
