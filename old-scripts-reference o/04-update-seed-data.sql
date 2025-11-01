-- Update the seed data with more realistic Starbucks-inspired options

-- Update base descriptions
UPDATE bases SET description = 'Rich espresso-based beverages' WHERE name = 'Coffee';
UPDATE bases SET description = 'Premium hot and iced tea selections' WHERE name = 'Tea';
UPDATE bases SET description = 'Fruit-infused refreshing beverages' WHERE name = 'Refresher';
UPDATE bases SET description = 'Blended ice coffee and cream beverages' WHERE name = 'Frappuccino';
UPDATE bases SET description = 'Steamed milk with rich chocolate' WHERE name = 'Hot Chocolate';

-- Add more seasonal syrups
UPDATE syrups SET is_seasonal = true WHERE name IN ('Pumpkin Spice', 'Peppermint', 'Toasted White Mocha', 'Chestnut Praline', 'Irish Cream', 'Funnel Cake');
