# Food Ordering & Billing System

A terminal-based TypeScript food ordering and billing application.

## Requirements covered

- FoodItem interface and 10 food items
- Guest | Member union
- Membership levels: silver, gold, platinum
- CartItem intersection type
- Literal OrderStatus union
- Cash | Card | UPI payment union
- Type narrowing with `in`, equality checks and `switch`
- `never` exhaustive checks
- Subtotal, membership discount, additional discount and 5% GST
- Discriminated `BillResult` union
- Terminal menu using Node.js `readline/promises`
- Additional feature: customer display + order status workflow

## Run

```bash
npm install
npm run dev
```

For a compiled build:

```bash
npm run build
npm start
```

No frontend, classes, generics or `any` are used.
