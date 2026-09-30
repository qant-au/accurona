# Item list

The specification each element is built from. Sizes are width × depth ×
height in cm (`m` = mount height in cm). "symbol" means the element is drawn on
plans as a 40 cm symbol; see the README. Beds are 100 cm tall to the top of the
headboard.

A row marked "(done)" or covered by a note already exists in `src/elements/`.

### Living (`living`)

| id                 | name                 | W×D×H            |
| ------------------ | -------------------- | ---------------- |
| sofa-2             | Sofa, 2-Seat         | 160×90×85        |
| sofa-3             | Sofa, 3-Seat (done)  | 210×90×85        |
| sofa-corner        | Corner Sofa          | 250×250×85       |
| armchair           | Armchair             | 85×85×85         |
| recliner           | Recliner             | 90×95×100        |
| ottoman            | Ottoman              | 60×60×45         |
| coffee-table       | Coffee Table         | 110×60×45        |
| coffee-table-round | Round Coffee Table   | 80×80×45         |
| side-table         | Side Table           | 50×50×55         |
| tv-unit            | TV Unit              | 180×45×50        |
| tv-wall            | Wall-Mounted TV, 65" | 145×10×85, m 110 |
| bookcase           | Bookcase             | 90×35×200        |
| display-cabinet    | Display Cabinet      | 100×40×190       |
| floor-lamp         | Floor Lamp           | 40×40×170        |
| rug-rect           | Rug                  | 200×140×1        |
| rug-round          | Round Rug            | 160×160×1        |
| piano-upright      | Upright Piano        | 150×60×125       |
| plant-pot          | Indoor Plant         | 50×50×120        |

### Bedroom (`bedroom`)

| id               | name                                  | W×D×H       |
| ---------------- | ------------------------------------- | ----------- |
| bed              | Bed, Double (Legacy Id, Head At Left) | 200×150×100 |
| bed-single       | Bed, Single                           | 92×188×100  |
| bed-king-single  | Bed, King Single                      | 107×203×100 |
| bed-queen        | Bed, Queen (done)                     | 153×203×100 |
| bed-king         | Bed, King                             | 183×203×100 |
| bunk-bed         | Bunk Bed                              | 97×200×160  |
| cot              | Cot                                   | 75×135×90   |
| bedside-table    | Bedside Table                         | 45×40×55    |
| chest-of-drawers | Chest of Drawers                      | 90×45×100   |
| dresser          | Dresser                               | 140×50×80   |
| wardrobe-2       | Wardrobe, 2-Door                      | 100×60×200  |
| wardrobe-3       | Wardrobe, 3-Door                      | 150×60×200  |
| wardrobe-sliding | Built-In Robe, Sliding                | 240×60×240  |
| dressing-table   | Dressing Table                        | 100×45×75   |

Note: the legacy `bed` keeps its original Axonometra footprint, 200 × 150 (length along x, head at the left), so saved plans do not change shape. Every new bed is drawn head-to-the-top.

### Dining (`dining`)

| id                 | name                 | W×D×H      |
| ------------------ | -------------------- | ---------- |
| table              | Table (Existing Id)  | 150×90×75  |
| chair              | Chair (Existing Id)  | 50×50×90   |
| dining-table-4     | Dining Table, 4-Seat | 120×80×75  |
| dining-table-6     | Dining Table, 6-Seat | 180×90×75  |
| dining-table-8     | Dining Table, 8-Seat | 240×100×75 |
| dining-table-round | Round Dining Table   | 110×110×75 |
| bar-stool          | Bar Stool            | 40×40×75   |
| sideboard          | Sideboard            | 180×45×80  |
| high-chair         | High Chair           | 55×70×105  |
| bench-seat         | Bench Seat           | 150×40×45  |

### Kitchen (`kitchen`)

| id                | name                | W×D×H           |
| ----------------- | ------------------- | --------------- |
| base-cabinet-600  | Base Cabinet 600    | 60×60×90        |
| base-cabinet-900  | Base Cabinet 900    | 90×60×90        |
| corner-cabinet    | Corner Base Cabinet | 90×90×90        |
| wall-cabinet-600  | Wall Cabinet 600    | 60×35×70, m 145 |
| pantry            | Pantry Cupboard     | 60×60×220       |
| sink-single       | Sink, Single Bowl   | 60×60×90        |
| sink-double       | Sink, Double Bowl   | 120×60×90       |
| cooktop           | Cooktop, 4 Burner   | 60×60×90        |
| cooktop-5         | Cooktop, 5 Burner   | 90×60×90        |
| oven-freestanding | Freestanding Oven   | 60×60×90        |
| wall-oven         | Wall Oven Tower     | 60×60×220       |
| rangehood         | Rangehood           | 90×50×60, m 160 |
| fridge            | Fridge              | 70×70×180       |
| fridge-french     | Fridge, French Door | 90×75×180       |
| dishwasher        | Dishwasher          | 60×60×85        |
| microwave         | Microwave           | 50×40×30, m 90  |
| island-bench      | Island Bench        | 240×100×90      |
| breakfast-bar     | Breakfast Bar       | 180×50×105      |
| kitchen-bin       | Kitchen Bin         | 40×35×65        |
| butler-sink       | Butler's Sink       | 80×60×90        |

### Bathroom and laundry (`bathroom`)

| id                  | name               | W×D×H          |
| ------------------- | ------------------ | -------------- |
| toilet              | Toilet (done)      | 40×70×80       |
| toilet-wall-hung    | Toilet, Wall-Hung  | 38×55×40       |
| urinal              | Urinal             | 40×35×60, m 50 |
| basin-vanity        | Vanity Basin       | 75×45×85       |
| basin-vanity-double | Double Vanity      | 150×50×85      |
| basin-wall          | Wall Basin         | 50×40×20, m 80 |
| basin-pedestal      | Pedestal Basin     | 55×45×85       |
| bath                | Bath               | 170×75×55      |
| bath-freestanding   | Freestanding Bath  | 170×80×60      |
| bath-corner         | Corner Bath        | 140×140×55     |
| shower-900          | Shower, 900 Square | 90×90×200      |
| shower-rect         | Shower, 1200 × 900 | 120×90×200     |
| shower-walk-in      | Walk-In Shower     | 140×90×200     |
| towel-rail          | Heated Towel Rail  | 60×10×90, m 60 |
| washing-machine     | Washing Machine    | 60×60×85       |
| dryer               | Clothes Dryer      | 60×60×85       |
| laundry-tub         | Laundry Tub        | 60×50×90       |
| linen-cupboard      | Linen Cupboard     | 60×45×200      |

### Office (`office`)

| id                  | name                     | W×D×H            |
| ------------------- | ------------------------ | ---------------- |
| desk                | Desk                     | 150×75×73        |
| desk-small          | Desk, Compact            | 120×60×73        |
| desk-l              | L-Shaped Desk            | 160×160×73       |
| desk-sit-stand      | Sit-Stand Desk           | 160×80×73        |
| workstation-pod-2   | Workstation Pod, 2       | 160×150×73       |
| workstation-pod-4   | Workstation Pod, 4       | 320×150×120      |
| office-chair        | Office Chair             | 65×65×110        |
| visitor-chair       | Visitor Chair            | 55×55×85         |
| meeting-table-4     | Meeting Table, 4         | 120×120×73       |
| meeting-table-8     | Boardroom Table, 8       | 300×120×73       |
| meeting-table-round | Round Meeting Table      | 100×100×73       |
| reception-desk      | Reception Desk           | 240×80×110       |
| filing-cabinet      | Filing Cabinet, 4-Drawer | 47×62×132        |
| lateral-filer       | Lateral Filer            | 90×45×100        |
| storage-cupboard    | Storage Cupboard         | 90×45×200        |
| lockers             | Lockers, Bank of 4       | 120×45×180       |
| mobile-pedestal     | Mobile Pedestal          | 40×55×60         |
| printer-mfd         | Multifunction Printer    | 60×65×115        |
| shredder            | Shredder                 | 40×30×65         |
| whiteboard-mobile   | Mobile Whiteboard        | 180×60×190       |
| display-screen      | Meeting Room Display     | 170×10×100, m 90 |
| phone-booth         | Phone Booth              | 100×100×220      |
| lounge-chair        | Breakout Lounge Chair    | 75×75×80         |
| water-cooler        | Water Cooler             | 35×35×110        |

### Comms and server room (`comms`)

Racks are generated in `src/elements/comms.mjs` (26 variants): wall-mount 600 × 450 at 6/9/12/15U; 600 × 600 at 18/24/27U; 600 × 800 at 27/32/37/42U; server racks 600 and 800 wide × 1000/1100/1200 deep at 42 and 45U; open frame 2-post 24/42U and 4-post 42U. Also done: `split-ac-indoor`.

| id                  | name                             | W×D×H            | tags    |
| ------------------- | -------------------------------- | ---------------- | ------- |
| ups-tower           | UPS, Tower                       | 20×45×35         | power   |
| ups-large           | UPS, Floor-Standing              | 35×80×130        | power   |
| battery-cabinet     | Battery Cabinet                  | 60×85×200        | power   |
| distribution-board  | Distribution Board               | 60×20×90, m 110  | power   |
| ats-panel           | Transfer Switch Panel            | 60×25×80, m 110  | power   |
| generator           | Standby Generator                | 220×110×150      | power   |
| crac-unit           | Precision Air Conditioner (CRAC) | 100×90×195       | cooling |
| in-row-cooler       | In-Row Cooler                    | 30×120×200       | cooling |
| ac-ceiling-cassette | AC Ceiling Cassette              | 84×84×25, m 270  | cooling |
| ac-condenser        | AC Outdoor Unit                  | 85×35×70         | cooling |
| containment-door    | Aisle Containment Door           | 120×10×200       | cooling |
| fire-suppression    | Gas Suppression Cylinder         | 40×40×170        | fire    |
| cable-tray          | Cable Tray Section, 1 m          | 100×30×10, m 250 | network |
| ladder-rack         | Ladder Rack Section, 1 m         | 100×45×5, m 240  | network |
| odf-panel           | Fibre Termination Cabinet        | 60×30×60, m 120  | network |
| kvm-console         | KVM Console Cart                 | 60×70×110        | network |
| raised-floor-tile   | Perforated Floor Tile            | 60×60×1          | cooling |

### Networking and AV (`network`)

| id               | name                         | W×D×H                        | tags              |
| ---------------- | ---------------------------- | ---------------------------- | ----------------- |
| wifi-ap          | Wi-Fi Access Point           | 40×40 symbol, 22×22×4, m 270 | network           |
| network-switch   | Network Switch (Desktop)     | 44×30×5                      | network           |
| router           | Router                       | 30×20×5                      | network           |
| modem-nbn        | NBN Connection Box           | 30×20×10, m 30               | network           |
| data-outlet      | Data Outlet                  | 40×40 symbol, m 30           | network           |
| floor-box        | Floor Box                    | 40×40×10                     | network, power    |
| projector        | Ceiling Projector            | 40×40 symbol, m 270          | av                |
| projector-screen | Projector Screen             | 240×15×180, m 90             | av                |
| speaker-ceiling  | Ceiling Speaker              | 40×40 symbol, m 270          | av                |
| video-bar        | Video Conferencing Bar       | 90×10×10, m 150              | av                |
| pc-tower         | Desktop PC                   | 20×45×45                     | network           |
| monitor          | Monitor, 27"                 | 62×20×45                     | network           |
| laptop           | Laptop                       | 34×24×2                      | network           |
| ip-phone         | Desk Phone                   | 22×20×15                     | network           |
| firewall         | Firewall Appliance (Desktop) | 30×20×5                      | network, security |
| server-tower     | Tower Server                 | 20×60×45                     | network           |
| nas              | Network Storage (NAS)        | 20×25×25                     | network           |

### Security (`security`)

| id           | name                    | W×D×H               | tags              |
| ------------ | ----------------------- | ------------------- | ----------------- |
| cctv-dome    | CCTV Dome Camera (done) | 40×40 symbol, m 270 | security          |
| cctv-bullet  | CCTV Bullet Camera      | 40×40 symbol, m 250 | security          |
| cctv-ptz     | CCTV PTZ Camera         | 40×40 symbol, m 300 | security          |
| cctv-fisheye | CCTV 360° Camera        | 40×40 symbol, m 270 | security          |
| nvr          | Network Video Recorder  | 44×40×10            | security, network |
| alarm-panel  | Alarm Control Panel     | 40×10×40, m 150     | security          |
| alarm-keypad | Alarm Keypad            | 40×40 symbol, m 140 | security          |
| pir-sensor   | Motion Detector (PIR)   | 40×40 symbol, m 240 | security          |
| door-contact | Door Contact            | 40×40 symbol, m 200 | security          |
| glass-break  | Glass-Break Detector    | 40×40 symbol, m 240 | security          |
| siren-strobe | Siren and Strobe        | 40×40 symbol, m 250 | security          |
| card-reader  | Access Card Reader      | 40×40 symbol, m 110 | security          |
| exit-button  | Request-to-Exit Button  | 40×40 symbol, m 110 | security          |
| maglock      | Magnetic Door Lock      | 40×40 symbol, m 200 | security          |
| intercom     | Video Intercom          | 40×40 symbol, m 140 | security          |
| turnstile    | Turnstile               | 50×140×100          | security          |
| speed-gate   | Speed Gate Lane         | 120×150×100         | security          |
| safe         | Safe                    | 50×50×70            | security          |
| key-cabinet  | Key Cabinet             | 40×10×50, m 140     | security          |
| bollard      | Bollard                 | 30×30×100           | security          |

### Fire and safety (`safety`)

| id                | name                 | W×D×H                  | tags |
| ----------------- | -------------------- | ---------------------- | ---- |
| smoke-detector    | Smoke Detector       | 40×40 symbol, m 270    | fire |
| heat-detector     | Heat Detector        | 40×40 symbol, m 270    | fire |
| fire-extinguisher | Fire Extinguisher    | 40×40 symbol, 20×20×60 | fire |
| fire-blanket      | Fire Blanket         | 40×40 symbol, m 120    | fire |
| hose-reel         | Fire Hose Reel       | 80×30×80, m 90         | fire |
| fire-panel        | Fire Indicator Panel | 60×15×80, m 120        | fire |
| manual-call-point | Manual Call Point    | 40×40 symbol, m 110    | fire |
| exit-sign         | Exit Sign            | 40×40 symbol, m 220    | fire |
| emergency-light   | Emergency Light      | 40×40 symbol, m 270    | fire |
| first-aid         | First Aid Kit        | 40×40 symbol, m 120    |      |
| aed               | Defibrillator (AED)  | 40×40 symbol, m 110    |      |
| eyewash           | Eyewash Station      | 50×40×100              |      |

### Outdoor and small buildings (`outdoor`)

| id               | name                   | W×D×H           |
| ---------------- | ---------------------- | --------------- |
| outdoor-table    | Outdoor Table          | 180×90×75       |
| outdoor-chair    | Outdoor Chair          | 55×60×85        |
| sun-lounger      | Sun Lounger            | 70×195×35       |
| bbq              | Barbecue               | 140×60×110      |
| outdoor-sofa     | Outdoor Sofa           | 200×85×75       |
| umbrella         | Market Umbrella        | 270×270×250     |
| planter          | Planter Box            | 100×40×50       |
| tree             | Tree                   | 400×400×600     |
| shrub            | Shrub                  | 100×100×100     |
| water-tank       | Water Tank, 5000 L     | 180×180×220     |
| hot-water-system | Hot Water System       | 60×60×170       |
| heat-pump        | Heat Pump Water Heater | 60×60×190       |
| solar-inverter   | Solar Inverter         | 45×20×60, m 120 |
| wheelie-bin      | Wheelie Bin            | 60×75×105       |
| clothesline      | Rotary Clothesline     | 300×300×200     |
| car              | Car                    | 185×470×150     |
| bicycle          | Bicycle                | 60×175×100      |
| workbench        | Workbench              | 180×70×90       |
| garden-shed      | Garden Shed, 2.4 × 1.8 | 240×180×210     |
| pool             | Swimming Pool          | 700×350×150     |

### Structure (`structure`)

| id              | name             | W×D×H           |
| --------------- | ---------------- | --------------- |
| stairs-straight | Stairs, Straight | 100×400×300     |
| stairs-l        | Stairs, L-Shaped | 200×375×300     |
| stairs-u        | Stairs, U-Shaped | 220×300×300     |
| stairs-spiral   | Spiral Stairs    | 160×160×300     |
| column-square   | Column, Square   | 40×40×270       |
| column-round    | Column, Round    | 40×40×270       |
| fireplace       | Fireplace        | 150×60×110      |
| lift            | Lift             | 160×160×270     |
| ramp            | Ramp             | 120×400×33      |
| ladder          | Fixed Ladder     | 50×30×300       |
| skylight        | Skylight         | 60×120×1, m 270 |
| void            | Void / Opening   | 200×200×1       |
