# Template Component Order Configuration

## Overview
The PDF component order can now be customized for each template by modifying the `componentOrder` array in the `TEMPLATES` configuration.

## Location
**File:** `rationale_gen/frontend/src/App.jsx` (lines 32-55)

## Available Components

The following components can be reordered (header and footer are always first/last):

1. **`'chart'`** - Chart image section
2. **`'tradingDetails'`** - Entry, Targets, Stoploss row
3. **`'technicalCommentary'`** - Technical commentary section
4. **`'disclaimer'`** - Disclaimer section

## How to Change Component Order

Simply modify the `componentOrder` array in the template configuration:

```javascript
export const TEMPLATES = {
  classic: {
    id: 'classic',
    name: 'Template 1',
    description: 'Template 1',
    nameColor: { r: 0, g: 0, b: 0 },
    nameColorHex: '#000000',
    componentOrder: ['chart', 'tradingDetails', 'technicalCommentary', 'disclaimer'] // ← Modify this array
  },
  // ... other templates
}
```

## Examples

### Current Order (Default)
```javascript
componentOrder: ['chart', 'tradingDetails', 'technicalCommentary', 'disclaimer']
```
**Result:** Header → Chart → Trading Details → Technical Commentary → Disclaimer → Footer

### Example: Technical Commentary First
```javascript
componentOrder: ['technicalCommentary', 'chart', 'tradingDetails', 'disclaimer']
```
**Result:** Header → Technical Commentary → Chart → Trading Details → Disclaimer → Footer

### Example: Trading Details Before Chart
```javascript
componentOrder: ['tradingDetails', 'chart', 'technicalCommentary', 'disclaimer']
```
**Result:** Header → Trading Details → Chart → Technical Commentary → Disclaimer → Footer

### Example: Disclaimer Before Technical Commentary
```javascript
componentOrder: ['chart', 'tradingDetails', 'disclaimer', 'technicalCommentary']
```
**Result:** Header → Chart → Trading Details → Disclaimer → Technical Commentary → Footer

## Notes

- **Header** is always rendered first (before any components in the array)
- **Footer** is always rendered last (after all components in the array)
- You can include components multiple times if needed (though not recommended)
- If a component type is misspelled or doesn't exist, a warning will be logged and it will be skipped
- The order is processed left-to-right as specified in the array

## Implementation Details

The component rendering happens in the `exportToPDF` function using a `forEach` loop:

```javascript
componentOrder.forEach((componentType) => {
  switch (componentType) {
    case 'chart':
      yPos = renderChart(doc, { ... })
      break
    case 'tradingDetails':
      yPos = renderTradingDetails(doc, { ... })
      break
    // ... etc
  }
})
```

## Current Template Orders

- **Template 1 (classic):** `['chart', 'tradingDetails', 'technicalCommentary', 'disclaimer']`
- **Template 2 (blue):** `['chart', 'tradingDetails', 'technicalCommentary', 'disclaimer']`
- **Template 3 (green):** `['chart', 'tradingDetails', 'technicalCommentary', 'disclaimer']`

All templates currently use the same default order. Modify the `componentOrder` array for each template to create different layouts.

