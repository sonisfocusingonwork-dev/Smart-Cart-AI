# Fix Plan - Step by Step

## Goals
- [x] Bug 1: Fix React Promise error in LoginScreen.tsx (onJoinGroup type + await)
- [x] Bug 2: Fix 401 Unauthorized error in App.tsx (remove admin-required cart calls from joinShoppingGroup and leaveGroup)
- [x] Bug 3: Fix undefined variable reference in api.ts (getLogs uses undefined `log`)

## Steps
- [x] **Step 1**: Fix `LoginScreen.tsx` - Update `onJoinGroup` type to return `Promise<string | null>`, make submit handler async
- [x] **Step 2**: Fix `App.tsx` - Remove `api.getCarts()` and `api.updateCart()` from `joinShoppingGroup` and `leaveGroup`
- [x] **Step 3**: Fix `api.ts` - Fix `getLogs()` method body (uses undefined `log` variable)

