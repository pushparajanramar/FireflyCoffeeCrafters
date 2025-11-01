-- Update bases with detailed coffee properties
UPDATE bases SET
  aroma = 'Rich, bold, earthy with hints of dark chocolate and roasted nuts',
  flavor = 'Deep, robust with notes of dark chocolate, caramel, and subtle smokiness',
  acidity = 'Low to medium acidity with smooth, balanced brightness',
  body = 'Full-bodied, rich and creamy mouthfeel',
  aftertaste = 'Long-lasting finish with lingering chocolate and nutty notes'
WHERE name = 'Coffee';

UPDATE bases SET
  aroma = 'Intense, concentrated with deep caramel and dark fruit notes',
  flavor = 'Bold, complex with dark chocolate, caramel, and slight bitterness',
  acidity = 'Bright, lively acidity with citrus undertones',
  body = 'Syrupy, thick and velvety texture',
  aftertaste = 'Persistent, complex finish with chocolate and fruit notes'
WHERE name = 'Espresso';

UPDATE bases SET
  aroma = 'Delicate, grassy with subtle floral and vegetal notes',
  flavor = 'Light, refreshing with grassy, slightly sweet and umami notes',
  acidity = 'Gentle acidity with clean, crisp brightness',
  body = 'Light to medium body with smooth, silky texture',
  aftertaste = 'Clean, refreshing finish with lingering sweetness'
WHERE name = 'Green Tea';

UPDATE bases SET
  aroma = 'Malty, robust with hints of honey and dried fruit',
  flavor = 'Bold, brisk with malty sweetness and slight astringency',
  acidity = 'Moderate acidity with tannic structure',
  body = 'Medium to full body with smooth, rounded texture',
  aftertaste = 'Lingering malty sweetness with subtle dryness'
WHERE name = 'Black Tea';

UPDATE bases SET
  aroma = 'Rich, creamy with sweet cocoa and vanilla notes',
  flavor = 'Sweet, chocolatey with creamy milk and subtle cocoa bitterness',
  acidity = 'Low acidity, smooth and mellow',
  body = 'Full-bodied, creamy and indulgent texture',
  aftertaste = 'Sweet, lingering chocolate finish'
WHERE name = 'Hot Chocolate';

-- Update milks with flavor profiles
UPDATE milks SET
  flavor_profile = 'Creamy, slightly sweet with natural dairy richness',
  body_contribution = 'Full, rich body with smooth, velvety texture'
WHERE name = 'Whole Milk';

UPDATE milks SET
  flavor_profile = 'Light, clean with subtle dairy sweetness',
  body_contribution = 'Medium body with smooth, lighter texture'
WHERE name = '2% Milk';

UPDATE milks SET
  flavor_profile = 'Very light, clean with minimal dairy flavor',
  body_contribution = 'Light body with thin, watery texture'
WHERE name = 'Nonfat Milk';

UPDATE milks SET
  flavor_profile = 'Nutty, slightly sweet with earthy almond notes',
  body_contribution = 'Light to medium body with smooth, nutty texture'
WHERE name = 'Almond Milk';

UPDATE milks SET
  flavor_profile = 'Creamy, rich with natural coconut sweetness',
  body_contribution = 'Full body with tropical, creamy texture'
WHERE name = 'Coconut Milk';

UPDATE milks SET
  flavor_profile = 'Neutral, clean with subtle bean sweetness',
  body_contribution = 'Medium body with smooth, silky texture'
WHERE name = 'Soy Milk';

UPDATE milks SET
  flavor_profile = 'Creamy, slightly sweet with mild oat flavor',
  body_contribution = 'Full body with rich, creamy texture'
WHERE name = 'Oat Milk';

-- Update syrups with flavor notes
UPDATE syrups SET
  flavor_notes = 'Pure sweetness without additional flavor',
  sweetness_level = 'High'
WHERE name = 'Classic Syrup';

UPDATE syrups SET
  flavor_notes = 'Rich, buttery caramel with toffee notes',
  sweetness_level = 'High'
WHERE name = 'Caramel';

UPDATE syrups SET
  flavor_notes = 'Sweet, creamy vanilla with floral undertones',
  sweetness_level = 'Medium-High'
WHERE name = 'Vanilla';

UPDATE syrups SET
  flavor_notes = 'Nutty, toasted hazelnut with buttery sweetness',
  sweetness_level = 'Medium-High'
WHERE name = 'Hazelnut';

UPDATE syrups SET
  flavor_notes = 'Warm, spicy cinnamon with sweet heat',
  sweetness_level = 'Medium'
WHERE name = 'Cinnamon Dolce';

UPDATE syrups SET
  flavor_notes = 'Festive blend of pumpkin, cinnamon, nutmeg, and clove',
  sweetness_level = 'High'
WHERE name = 'Pumpkin Spice';

UPDATE syrups SET
  flavor_notes = 'Rich, buttery toffee with caramelized sugar notes',
  sweetness_level = 'High'
WHERE name = 'Toffee Nut';

UPDATE syrups SET
  flavor_notes = 'Sweet, creamy white chocolate with vanilla hints',
  sweetness_level = 'Very High'
WHERE name = 'White Chocolate Mocha';

-- Update toppings with flavor impact
UPDATE toppings SET
  flavor_impact = 'Light, airy sweetness with creamy texture',
  texture_contribution = 'Fluffy, cloud-like topping'
WHERE name = 'Whipped Cream';

UPDATE toppings SET
  flavor_impact = 'Rich, sweet chocolate with slight bitterness',
  texture_contribution = 'Smooth drizzle with visual appeal'
WHERE name = 'Chocolate Drizzle';

UPDATE toppings SET
  flavor_impact = 'Sweet, buttery caramel with toffee notes',
  texture_contribution = 'Sticky, sweet drizzle'
WHERE name = 'Caramel Drizzle';

UPDATE toppings SET
  flavor_impact = 'Warm, spicy cinnamon with aromatic sweetness',
  texture_contribution = 'Fine powder dusting'
WHERE name = 'Cinnamon Powder';

UPDATE toppings SET
  flavor_impact = 'Rich, bittersweet cocoa with deep chocolate flavor',
  texture_contribution = 'Fine powder dusting'
WHERE name = 'Cocoa Powder';

UPDATE toppings SET
  flavor_impact = 'Crunchy, sweet chocolate with textural contrast',
  texture_contribution = 'Crispy, crunchy pieces'
WHERE name = 'Chocolate Chips';
