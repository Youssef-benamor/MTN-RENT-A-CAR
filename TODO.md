# Customer Bookings UI Improvements

## Plan Overview

Improve validation, UX polish, accessibility, mobile support for BookingModal + FastTrackForm.

## Steps

- [x] 1. Enhance FastTrackForm.tsx ✅
  - [x] Phone/email validation (Tunisian phone, regex)
  - [x] File upload limits (5MB), drag-drop zone
  - [x] Required Terms & Conditions checkbox
  - [x] Promo code field ('WELCOME10' = 10% discount)
  - [x] Enhanced states: loading spinner, inline errors, success confetti
  - [x] Upload progress bar

- [ ] 2. Improve BookingModal.tsx
  - Date range preview badges
  - Carousel: touch-swipe, keyboard navigation
  - Animate addons/total on change
  - ARIA attributes for modal/gallery
  - Optimized mobile stacking/buttons

- [ ] 3. Polish CarCard.tsx
  - Subtle pulse on bookable 'Book Now' button

- [ ] 4. Test & verify
  - Responsive (mobile/desktop)
  - Form submission + uploads
  - i18n consistency
  - Performance

- [x] 0. Planning & TODO created ✅
