// The 47 branches supplied by Travelex / Tourvest Forex, used to seed the
// database the first time the app starts (only if the branches table is empty).
"use strict";

const BRANCHES = [
  ["B001", "Preller Square (Bloemfontein)", "Free State", "Shop 15, Preller Square, Cnr Graaff-Reinet and Pienaar Street, Bloemfontein, 9301"],
  ["B002", "George", "Western Cape", "Shop 3A, Shamrock Place, 97 York Rd, George, 6530"],
  ["B003", "PE Greenacres", "Eastern Cape", "Shop 97, Greenacres Shopping Centre, Old Cape Road, Newton Park, Port Elizabeth"],
  ["B004", "Walmer Park Shopping Centre (PE)", "Eastern Cape", "Shop No. 64, Walmer Park Shopping Centre, Port Elizabeth, 6000"],
  ["B005", "Balfour Park Shopping Centre", "Gauteng", "Shop No. 123, Athol Oaklands Rd, Highlands North, 2132"],
  ["B006", "Benmore", "Gauteng", "Shop G06, Benmore Shopping Centre, Cnr 11th & Rivonia Road, Sandton"],
  ["B007", "Brooklyn Mall", "Gauteng", "Shop 319, Brooklyn Mall, 338 Bronkhorst Street, New Muckleneuk, Brooklyn, 0181"],
  ["B008", "Centurion Shopping Centre", "Gauteng", "Shop 107A, Lower Level, Centurion Shopping Centre, Centurion, 0157"],
  ["B009", "Clearwater Shopping Centre", "Gauteng", "Shop 138A, Clearwater Shopping Centre, Cnr Hendrik Potgieter and Christiaan de Wet, Helderkruin, Roodepoort, 1724"],
  ["B010", "Cresta Shopping Centre", "Gauteng", "Shop L4a, Cresta Shopping Centre, Cnr Beyers Naude Dr. and Weltevreden Road, Cresta, 2194"],
  ["B011", "East Rand Mall", "Gauteng", "Shop 107, Bentle Drive, East Rand Mall, Boksburg, 1459"],
  ["B012", "Eastgate", "Gauteng", "Shop L36, Entrance No 1, 43 Bradford Road, Bedfordview, 2007"],
  ["B013", "Emperor's Palace", "Gauteng", "Emperor's Palace, 64 Jones Street, Kempton Park"],
  ["B014", "Fourways Mall", "Gauteng", "Shop G60B, Entrance 2, Fourways Mall, Cnr William Nicol Dr & Witkoppen Rd, Fourways, 2055"],
  ["B015", "Fourways View", "Gauteng", "Shop NG88, Fourways View, Cnr Fourways Blvd & Cedar Rd, Witkoppen, 2191"],
  ["B016", "Hillbrow", "Gauteng", "1st Floor, Hollywood Heights, 39 Pretoria Street, Hillbrow"],
  ["B017", "Kolonnade Shopping Centre", "Gauteng", "Shop 9A, Kolonnade Shopping Centre, Cnr Zambesi Drive & Dr Van Der Merwe Rd, Montana Park, Pretoria, 0181"],
  ["B018", "Mall of Africa", "Gauteng", "Shop 2076, Level 5, Mall of Africa, Magwa Road, Waterfall Park, Midrand"],
  ["B019", "Menlyn Park Shopping Centre", "Gauteng", "Shop LF65, Menlyn Park Shopping Centre, Cnr Atterbury and Lois Strs, Menlo Park, Pretoria, 0081"],
  ["B020", "OR Tambo International Airport", "Gauteng", "International Arrivals Hall, Terminal 2, OR Tambo International Airport, Kempton Park, 1619"],
  ["B021", "Park Station", "Gauteng", "Shop No B02, Mezzanine Level, Banking Area, Johannesburg Park Station, Rissik Street, Johannesburg"],
  ["B022", "River Square Shopping Centre", "Gauteng", "Shop No. W5, 6A Nile Drive, Three Rivers, Vereeniging, 1929"],
  ["B023", "Rosettenville", "Gauteng", "Shop L01B, Rosettenville Junction Centre, Cnr Jeranium & Prairie Street, Rosettenville"],
  ["B024", "Sandton City", "Gauteng", "Shop BC36A, Banking Court Level, Sandton City, Sandton, 2146"],
  ["B025", "Surrey House", "Gauteng", "Shop 3, Ground Floor, Surrey House, 35 Rissik Street, Johannesburg, 2000"],
  ["B026", "The Glen", "Gauteng", "Shop UG14, The Glen, Letaba & Orpen Street, Eastcliff, Oakdene"],
  ["B027", "Ballito", "KwaZulu-Natal", "Shop 247A, Ballito Junction Mall, Ballito"],
  ["B028", "Galleria", "KwaZulu-Natal", "Shop 39A, Galleria Shopping Centre, Moss Kolnick Drive, Amanzimtoti"],
  ["B029", "Gateway", "KwaZulu-Natal", "Shop F62/28, Upper Level, Gateway Theatre of Shopping, Umhlanga Rocks, 4319"],
  ["B030", "Musgrave", "KwaZulu-Natal", "Shop 2, FNB House, Musgrave Centre, 151 Musgrave Road, Durban"],
  ["B031", "Pavillion", "KwaZulu-Natal", "Shop No. 240, Pavillion Shopping Centre, 5 Jack Martens Drive, Westville, 3630"],
  ["B032", "Pietermaritzburg", "KwaZulu-Natal", "Shop No. 21, Victoria Shopping Centre, 157 Victoria Rd, Pietermaritzburg, 3201"],
  ["B033", "Mall of the North", "Limpopo", "Shop L78, Mall of the North, Cnr R81 & N1, Bendor Ext 99, Polokwane"],
  ["B034", "Riverside Mall (Nelspruit)", "Mpumalanga", "Shop 236, Entrance 2, Riverside Mall, White River Road, Nelspruit, 1201"],
  ["B035", "Bayside", "Western Cape", "Shop E27, Bayside Shopping Centre, Blaauwberg Road, Table View"],
  ["B036", "Cape Gate", "Western Cape", "Shop L56, Cape Gate Mall, Okavango Road, Cape Town"],
  ["B037", "Cape Town International Airport (Purchases Only)", "Western Cape", "Shop 11, Terminal 2, International Arrivals Hall, Cape Town International Airport, Cape Town, 8001"],
  ["B038", "Cavendish", "Western Cape", "Shop G32 & G32B, Cavendish Square Mall, Claremont, Cape Town"],
  ["B039", "Century City, Canal Walk", "Western Cape", "Shop 229, Canal Walk, Century City, Milnerton, 7441"],
  ["B040", "Granger Bay", "Western Cape", "Shop 7117A, V & A Waterfront, Cape Town, 8001"],
  ["B041", "Green Market Square", "Western Cape", "Shop 9, Protea Assurance Building, Green Market Square, Cape Town"],
  ["B042", "Long Street", "Western Cape", "Ground Floor, Shop 57, Long Street, Cape Town, 8001"],
  ["B043", "Paarl Mall", "Western Cape", "Shop 85, Paarl Mall, Paarl, 7620"],
  ["B044", "Somerset Mall", "Western Cape", "Shop 3, Somerset Mall, Intersection of N2 & R44, Somerset West, 7130"],
  ["B045", "Stellenbosch", "Western Cape", "28 Bird Street, Stellenbosch, 7600"],
  ["B046", "Tyger Valley", "Western Cape", "Shop BL095, Banking Hall, Entrance 3, Tyger Valley Shopping Centre, Willie van Schoor Avenue, Bellville, 7530"],
  ["B047", "V&A Waterfront", "Western Cape", "Ground Level Kiosk 2, V & A Shopping Centre, Waterfront, Cape Town, 8001"]
];

function makeBranch([id, name, region, address]) {
  return {
    id, name, region, address,
    manager: "", email: "", phone: "", stage: "Not Contacted",
    firstContact: "", lastContact: "", nextAction: "", nextActionDate: "", notes: ""
  };
}

module.exports = { BRANCHES, makeBranch };
