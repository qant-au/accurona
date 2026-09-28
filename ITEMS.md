# Item list

The specification each element is built from. Sizes are width × depth ×
height in cm (`m` = mount height in cm). "symbol" means the element is drawn on
plans as a 40 cm symbol; see the README. Beds are 100 cm tall to the top of the
headboard.

A row marked "(done)" or covered by a note already exists in `src/elements/`.

### Living (`living`)

| id                 | name                 | W×D×H            |
| ------------------ | -------------------- | ---------------- |
| sofa-2             | Sofa, 2-seat         | 160×90×85        |
| sofa-3             | Sofa, 3-seat (done)  | 210×90×85        |
| sofa-corner        | Corner sofa          | 250×250×85       |
| armchair           | Armchair             | 85×85×85         |
| recliner           | Recliner             | 90×95×100        |
| ottoman            | Ottoman              | 60×60×45         |
| coffee-table       | Coffee table         | 110×60×45        |
| coffee-table-round | Round coffee table   | 80×80×45         |
| side-table         | Side table           | 50×50×55         |
| tv-unit            | TV unit              | 180×45×50        |
| tv-wall            | Wall-mounted TV, 65" | 145×10×85, m 110 |
| bookcase           | Bookcase             | 90×35×200        |
| display-cabinet    | Display cabinet      | 100×40×190       |
| floor-lamp         | Floor lamp           | 40×40×170        |
| rug-rect           | Rug                  | 200×140×1        |
| rug-round          | Round rug            | 160×160×1        |
| piano-upright      | Upright piano        | 150×60×125       |
| plant-pot          | Indoor plant         | 50×50×120        |

### Bedroom (`bedroom`)

| id               | name                                  | W×D×H       |
| ---------------- | ------------------------------------- | ----------- |
| bed              | Bed, double (legacy id, head at left) | 200×150×100 |
| bed-single       | Bed, single                           | 92×188×55   |
| bed-king-single  | Bed, king single                      | 107×203×55  |
| bed-queen        | Bed, queen (done)                     | 153×203×100 |
| bed-king         | Bed, king                             | 183×203×55  |
| bunk-bed         | Bunk bed                              | 97×200×160  |
| cot              | Cot                                   | 75×135×90   |
| bedside-table    | Bedside table                         | 45×40×55    |
| chest-of-drawers | Chest of drawers                      | 90×45×100   |
| dresser          | Dresser                               | 140×50×80   |
| wardrobe-2       | Wardrobe, 2-door                      | 100×60×200  |
| wardrobe-3       | Wardrobe, 3-door                      | 150×60×200  |
| wardrobe-sliding | Built-in robe, sliding                | 240×60×240  |
| dressing-table   | Dressing table                        | 100×45×75   |

Note: the legacy `bed` keeps its original Axonometra footprint, 200 × 150 (length along x, head at the left), so saved plans do not change shape. Every new bed is drawn head-to-the-top.

### Dining (`dining`)

| id                 | name                 | W×D×H      |
| ------------------ | -------------------- | ---------- |
| table              | Table (existing id)  | 150×90×75  |
| chair              | Chair (existing id)  | 50×50×90   |
| dining-table-4     | Dining table, 4-seat | 120×80×75  |
| dining-table-6     | Dining table, 6-seat | 180×90×75  |
| dining-table-8     | Dining table, 8-seat | 240×100×75 |
| dining-table-round | Round dining table   | 110×110×75 |
| bar-stool          | Bar stool            | 40×40×75   |
| sideboard          | Sideboard            | 180×45×80  |
| high-chair         | High chair           | 55×70×105  |
| bench-seat         | Bench seat           | 150×40×45  |

### Kitchen (`kitchen`)

| id                | name                | W×D×H           |
| ----------------- | ------------------- | --------------- |
| base-cabinet-600  | Base cabinet 600    | 60×60×90        |
| base-cabinet-900  | Base cabinet 900    | 90×60×90        |
| corner-cabinet    | Corner base cabinet | 90×90×90        |
| wall-cabinet-600  | Wall cabinet 600    | 60×35×70, m 145 |
| pantry            | Pantry cupboard     | 60×60×220       |
| sink-single       | Sink, single bowl   | 60×60×90        |
| sink-double       | Sink, double bowl   | 120×60×90       |
| cooktop           | Cooktop, 4 burner   | 60×60×90        |
| cooktop-5         | Cooktop, 5 burner   | 90×60×90        |
| oven-freestanding | Freestanding oven   | 60×60×90        |
| wall-oven         | Wall oven tower     | 60×60×220       |
| rangehood         | Rangehood           | 90×50×60, m 160 |
| fridge            | Fridge              | 70×70×180       |
| fridge-french     | Fridge, French door | 90×75×180       |
| dishwasher        | Dishwasher          | 60×60×85        |
| microwave         | Microwave           | 50×40×30, m 90  |
| island-bench      | Island bench        | 240×100×90      |
| breakfast-bar     | Breakfast bar       | 180×50×105      |
| kitchen-bin       | Kitchen bin         | 40×35×65        |
| butler-sink       | Butler's sink       | 80×60×90        |

### Bathroom and laundry (`bathroom`)

| id                  | name               | W×D×H          |
| ------------------- | ------------------ | -------------- |
| toilet              | Toilet (done)      | 40×70×80       |
| toilet-wall-hung    | Toilet, wall-hung  | 38×55×40       |
| urinal              | Urinal             | 40×35×60, m 50 |
| basin-vanity        | Vanity basin       | 75×45×85       |
| basin-vanity-double | Double vanity      | 150×50×85      |
| basin-wall          | Wall basin         | 50×40×20, m 80 |
| basin-pedestal      | Pedestal basin     | 55×45×85       |
| bath                | Bath               | 170×75×55      |
| bath-freestanding   | Freestanding bath  | 170×80×60      |
| bath-corner         | Corner bath        | 140×140×55     |
| shower-900          | Shower, 900 square | 90×90×200      |
| shower-rect         | Shower, 1200 × 900 | 120×90×200     |
| shower-walk-in      | Walk-in shower     | 140×90×200     |
| towel-rail          | Heated towel rail  | 60×10×90, m 60 |
| washing-machine     | Washing machine    | 60×60×85       |
| dryer               | Clothes dryer      | 60×60×85       |
| laundry-tub         | Laundry tub        | 60×50×90       |
| linen-cupboard      | Linen cupboard     | 60×45×200      |

### Office (`office`)

| id                  | name                     | W×D×H            |
| ------------------- | ------------------------ | ---------------- |
| desk                | Desk                     | 150×75×73        |
| desk-small          | Desk, compact            | 120×60×73        |
| desk-l              | L-shaped desk            | 160×160×73       |
| desk-sit-stand      | Sit-stand desk           | 160×80×73        |
| workstation-pod-2   | Workstation pod, 2       | 160×150×73       |
| workstation-pod-4   | Workstation pod, 4       | 320×150×120      |
| office-chair        | Office chair             | 65×65×110        |
| visitor-chair       | Visitor chair            | 55×55×85         |
| meeting-table-4     | Meeting table, 4         | 120×120×73       |
| meeting-table-8     | Boardroom table, 8       | 300×120×73       |
| meeting-table-round | Round meeting table      | 100×100×73       |
| reception-desk      | Reception desk           | 240×80×110       |
| filing-cabinet      | Filing cabinet, 4-drawer | 47×62×132        |
| lateral-filer       | Lateral filer            | 90×45×100        |
| storage-cupboard    | Storage cupboard         | 90×45×200        |
| lockers             | Lockers, bank of 4       | 120×45×180       |
| mobile-pedestal     | Mobile pedestal          | 40×55×60         |
| printer-mfd         | Multifunction printer    | 60×65×115        |
| shredder            | Shredder                 | 40×30×65         |
| whiteboard-mobile   | Mobile whiteboard        | 180×60×190       |
| display-screen      | Meeting room display     | 170×10×100, m 90 |
| phone-booth         | Phone booth              | 100×100×220      |
| lounge-chair        | Breakout lounge chair    | 75×75×80         |
| water-cooler        | Water cooler             | 35×35×110        |

### Comms and server room (`comms`)

Racks are generated in `src/elements/comms.mjs` (26 variants): wall-mount 600 × 450 at 6/9/12/15U; 600 × 600 at 18/24/27U; 600 × 800 at 27/32/37/42U; server racks 600 and 800 wide × 1000/1100/1200 deep at 42 and 45U; open frame 2-post 24/42U and 4-post 42U. Also done: `split-ac-indoor`.

| id                  | name                             | W×D×H            | tags    |
| ------------------- | -------------------------------- | ---------------- | ------- |
| ups-tower           | UPS, tower                       | 20×45×35         | power   |
| ups-large           | UPS, floor-standing              | 35×80×130        | power   |
| battery-cabinet     | Battery cabinet                  | 60×85×200        | power   |
| distribution-board  | Distribution board               | 60×20×90, m 110  | power   |
| ats-panel           | Transfer switch panel            | 60×25×80, m 110  | power   |
| generator           | Standby generator                | 220×110×150      | power   |
| crac-unit           | Precision air conditioner (CRAC) | 100×90×195       | cooling |
| in-row-cooler       | In-row cooler                    | 30×120×200       | cooling |
| ac-ceiling-cassette | AC ceiling cassette              | 84×84×25, m 270  | cooling |
| ac-condenser        | AC outdoor unit                  | 85×35×70         | cooling |
| containment-door    | Aisle containment door           | 120×10×200       | cooling |
| fire-suppression    | Gas suppression cylinder         | 40×40×170        | fire    |
| cable-tray          | Cable tray section, 1 m          | 100×30×10, m 250 | network |
| ladder-rack         | Ladder rack section, 1 m         | 100×45×5, m 240  | network |
| odf-panel           | Fibre termination cabinet        | 60×30×60, m 120  | network |
| kvm-console         | KVM console cart                 | 60×70×110        | network |
| raised-floor-tile   | Perforated floor tile            | 60×60×1          | cooling |

### Networking and AV (`network`)

| id               | name                         | W×D×H                        | tags              |
| ---------------- | ---------------------------- | ---------------------------- | ----------------- |
| wifi-ap          | Wi-Fi access point           | 40×40 symbol, 22×22×4, m 270 | network           |
| network-switch   | Network switch (desktop)     | 44×30×5                      | network           |
| router           | Router                       | 30×20×5                      | network           |
| modem-nbn        | NBN connection box           | 30×20×10, m 30               | network           |
| data-outlet      | Data outlet                  | 40×40 symbol, m 30           | network           |
| floor-box        | Floor box                    | 40×40×10                     | network, power    |
| projector        | Ceiling projector            | 40×40 symbol, m 270          | av                |
| projector-screen | Projector screen             | 240×15×180, m 90             | av                |
| speaker-ceiling  | Ceiling speaker              | 40×40 symbol, m 270          | av                |
| video-bar        | Video conferencing bar       | 90×10×10, m 150              | av                |
| pc-tower         | Desktop PC                   | 20×45×45                     | network           |
| monitor          | Monitor, 27"                 | 62×20×45                     | network           |
| laptop           | Laptop                       | 34×24×2                      | network           |
| ip-phone         | Desk phone                   | 22×20×15                     | network           |
| firewall         | Firewall appliance (desktop) | 30×20×5                      | network, security |
| server-tower     | Tower server                 | 20×60×45                     | network           |
| nas              | Network storage (NAS)        | 20×25×25                     | network           |

### Security (`security`)

| id           | name                    | W×D×H               | tags              |
| ------------ | ----------------------- | ------------------- | ----------------- |
| cctv-dome    | CCTV dome camera (done) | 40×40 symbol, m 270 | security          |
| cctv-bullet  | CCTV bullet camera      | 40×40 symbol, m 250 | security          |
| cctv-ptz     | CCTV PTZ camera         | 40×40 symbol, m 300 | security          |
| cctv-fisheye | CCTV 360° camera        | 40×40 symbol, m 270 | security          |
| nvr          | Network video recorder  | 44×40×10            | security, network |
| alarm-panel  | Alarm control panel     | 40×10×40, m 150     | security          |
| alarm-keypad | Alarm keypad            | 40×40 symbol, m 140 | security          |
| pir-sensor   | Motion detector (PIR)   | 40×40 symbol, m 240 | security          |
| door-contact | Door contact            | 40×40 symbol, m 200 | security          |
| glass-break  | Glass-break detector    | 40×40 symbol, m 240 | security          |
| siren-strobe | Siren and strobe        | 40×40 symbol, m 250 | security          |
| card-reader  | Access card reader      | 40×40 symbol, m 110 | security          |
| exit-button  | Request-to-exit button  | 40×40 symbol, m 110 | security          |
| maglock      | Magnetic door lock      | 40×40 symbol, m 200 | security          |
| intercom     | Video intercom          | 40×40 symbol, m 140 | security          |
| turnstile    | Turnstile               | 50×140×100          | security          |
| speed-gate   | Speed gate lane         | 120×150×100         | security          |
| safe         | Safe                    | 50×50×70            | security          |
| key-cabinet  | Key cabinet             | 40×10×50, m 140     | security          |
| bollard      | Bollard                 | 30×30×100           | security          |

### Fire and safety (`safety`)

| id                | name                 | W×D×H                  | tags |
| ----------------- | -------------------- | ---------------------- | ---- |
| smoke-detector    | Smoke detector       | 40×40 symbol, m 270    | fire |
| heat-detector     | Heat detector        | 40×40 symbol, m 270    | fire |
| fire-extinguisher | Fire extinguisher    | 40×40 symbol, 20×20×60 | fire |
| fire-blanket      | Fire blanket         | 40×40 symbol, m 120    | fire |
| hose-reel         | Fire hose reel       | 80×30×80, m 90         | fire |
| fire-panel        | Fire indicator panel | 60×15×80, m 120        | fire |
| manual-call-point | Manual call point    | 40×40 symbol, m 110    | fire |
| exit-sign         | Exit sign            | 40×40 symbol, m 220    | fire |
| emergency-light   | Emergency light      | 40×40 symbol, m 270    | fire |
| first-aid         | First aid kit        | 40×40 symbol, m 120    |      |
| aed               | Defibrillator (AED)  | 40×40 symbol, m 110    |      |
| eyewash           | Eyewash station      | 50×40×100              |      |

### Outdoor and small buildings (`outdoor`)

| id               | name                   | W×D×H           |
| ---------------- | ---------------------- | --------------- |
| outdoor-table    | Outdoor table          | 180×90×75       |
| outdoor-chair    | Outdoor chair          | 55×60×85        |
| sun-lounger      | Sun lounger            | 70×195×35       |
| bbq              | Barbecue               | 140×60×110      |
| outdoor-sofa     | Outdoor sofa           | 200×85×75       |
| umbrella         | Market umbrella        | 270×270×250     |
| planter          | Planter box            | 100×40×50       |
| tree             | Tree                   | 400×400×600     |
| shrub            | Shrub                  | 100×100×100     |
| water-tank       | Water tank, 5000 L     | 180×180×220     |
| hot-water-system | Hot water system       | 60×60×170       |
| heat-pump        | Heat pump water heater | 60×60×190       |
| solar-inverter   | Solar inverter         | 45×20×60, m 120 |
| wheelie-bin      | Wheelie bin            | 60×75×105       |
| clothesline      | Rotary clothesline     | 300×300×200     |
| car              | Car                    | 185×470×150     |
| bicycle          | Bicycle                | 60×175×100      |
| workbench        | Workbench              | 180×70×90       |
| garden-shed      | Garden shed, 2.4 × 1.8 | 240×180×210     |
| pool             | Swimming pool          | 700×350×150     |

### Structure (`structure`)

| id              | name             | W×D×H           |
| --------------- | ---------------- | --------------- |
| stairs-straight | Stairs, straight | 100×300×300     |
| stairs-l        | Stairs, L-shaped | 200×250×300     |
| stairs-u        | Stairs, U-shaped | 220×300×300     |
| stairs-spiral   | Spiral stairs    | 160×160×300     |
| column-square   | Column, square   | 40×40×270       |
| column-round    | Column, round    | 40×40×270       |
| fireplace       | Fireplace        | 150×60×110      |
| lift            | Lift             | 160×160×270     |
| ramp            | Ramp             | 120×400×33      |
| ladder          | Fixed ladder     | 50×30×300       |
| skylight        | Skylight         | 60×120×1, m 270 |
| void            | Void / opening   | 200×200×1       |
