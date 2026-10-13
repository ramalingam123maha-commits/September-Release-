# Grand Horizon - Hotel Management System

A full-stack Hotel Management System with real-time WebSocket capabilities.

## Key Capabilities
- **Room Booking & Occupancy Matrix:** View live room availability across multiple floors and tiers (Deluxe Suite, Executive Penthouse, Double, Single), track occupancy rates.
- **Reservation Management:** Book rooms with automatic calculation of multi-night stays and tax-adjusted folios.
- **Guest Check-in & Check-out Desk:** One-click arrival check-in and checkout processing with automatic dispatch of turnover tasks.
- **Billing & Itemized Folios:** Invoicing with 10% tax calculation, ability to post in-room dining / spa service charges, and settle payments.
- **Staff Coordination Board:** Real-time dispatching and tracking of Housekeeping, Maintenance, Concierge, and Food & Beverage work orders.
- **Real-Time WebSocket Updates:** Every reservation, check-in, checkout, billing charge, and staff assignment broadcasts across all active terminals instantly.

## Verification
Automated test suite (`npm test`) validates endpoints and live WebSocket broadcasting.
