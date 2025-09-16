# **App Name**: AgriChain Trace

## Core Features:

- Landing Page: Display a landing page with options for Farmer, Distributor, Retailer, and Customer roles.
- Farmer Crop Registration: Allow farmers to register crop information including name, weight, harvest date, and photo. Generate a unique Lot ID and QR code upon submission. Saves data in JSON format. 
- Distributor Scan and Update: Enable distributors to scan the QR code and add transportation details like vehicle number, transport condition, and warehouse entry date/time. Simulate blockchain ledger update upon submission. Use an LLM tool to ensure that this new information does not conflict with other events that have already happened with that particular lot.
- Retailer Scan and Pack: Allow retailers to scan the Lot QR code and view the previous history from the 'blockchain'. Retailers can add shelf/store ID, expiry date, and create retail packs with new QR codes linked to the parent lot.
- Customer Scan and Trace: Enable customers to scan the QR code with their phone camera and view information about the crop, farmer, harvest date, distributor, and retailer, displayed in a timeline UI.

## Style Guidelines:

- Primary color: Earthy green (#8FBC8F) to evoke a sense of nature and agriculture.
- Background color: Light beige (#F5F5DC) to provide a clean and natural backdrop.
- Accent color: Warm brown (#A0522D) for highlighting important information and CTAs.
- Body font: 'PT Sans', a modern and readable humanist sans-serif for all text.
- Headline font: 'PT Sans', a modern and readable humanist sans-serif for all headlines.
- Use simple, clean icons related to agriculture, transportation, and retail to represent different stages and elements.
- Design a clear timeline layout for the customer view to illustrate the journey of the product from farm to the consumer.