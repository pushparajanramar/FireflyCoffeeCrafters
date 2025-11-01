-- Update prices for all options with realistic Starbucks-inspired values

-- Base prices (starting price for each drink type)
UPDATE bases SET price = 3.95 WHERE name = 'Coffee';
UPDATE bases SET price = 3.45 WHERE name = 'Tea';
UPDATE bases SET price = 4.95 WHERE name = 'Refresher';
UPDATE bases SET price = 5.45 WHERE name = 'Frappuccino';
UPDATE bases SET price = 3.75 WHERE name = 'Hot Chocolate';

-- Size prices (additional cost for larger sizes)
UPDATE sizes SET price = 0.00 WHERE name = 'Tall';
UPDATE sizes SET price = 0.50 WHERE name = 'Grande';
UPDATE sizes SET price = 0.80 WHERE name = 'Venti';
UPDATE sizes SET price = 1.00 WHERE name = 'Trenta';

-- Milk prices (premium milk options cost extra)
UPDATE milks SET price = 0.00 WHERE name = 'Whole Milk';
UPDATE milks SET price = 0.00 WHERE name = '2% Milk';
UPDATE milks SET price = 0.00 WHERE name = 'Nonfat Milk';
UPDATE milks SET price = 0.70 WHERE name = 'Oat Milk';
UPDATE milks SET price = 0.70 WHERE name = 'Almond Milk';
UPDATE milks SET price = 0.70 WHERE name = 'Coconut Milk';
UPDATE milks SET price = 0.70 WHERE name = 'Soy Milk';

-- Syrup prices (per pump)
UPDATE syrups SET price = 0.70 WHERE name IN ('Vanilla', 'Caramel', 'Hazelnut', 'Mocha', 'White Mocha', 'Cinnamon Dolce', 'Toffee Nut', 'Raspberry', 'Classic', 'Sugar-Free Vanilla');
UPDATE syrups SET price = 1.00 WHERE name IN ('Pumpkin Spice', 'Peppermint', 'Toasted White Mocha', 'Chestnut Praline', 'Irish Cream', 'Funnel Cake');

-- Topping prices
UPDATE toppings SET price = 0.60 WHERE name = 'Whipped Cream';
UPDATE toppings SET price = 0.50 WHERE name = 'Caramel Drizzle';
UPDATE toppings SET price = 0.50 WHERE name = 'Mocha Drizzle';
UPDATE toppings SET price = 0.70 WHERE name = 'Cinnamon Powder';
UPDATE toppings SET price = 0.70 WHERE name = 'Cocoa Powder';
UPDATE toppings SET price = 0.80 WHERE name = 'Cookie Crumbles';
UPDATE toppings SET price = 0.80 WHERE name = 'Java Chips';
UPDATE toppings SET price = 1.00 WHERE name = 'Cold Foam';
UPDATE toppings SET price = 1.20 WHERE name = 'Sweet Cream Cold Foam';

-- Temperature prices (no extra charge)
UPDATE temperatures SET price = 0.00;

-- Ice level prices (no extra charge)
UPDATE ice_levels SET price = 0.00;

-- Espresso shot prices (per shot)
UPDATE espresso_shots SET price = 0.90 WHERE shots = 1;
UPDATE espresso_shots SET price = 1.80 WHERE shots = 2;
UPDATE espresso_shots SET price = 2.70 WHERE shots = 3;
UPDATE espresso_shots SET price = 3.60 WHERE shots = 4;
