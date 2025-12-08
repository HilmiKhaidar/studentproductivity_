# Pattern Update untuk Notion Style

## Pattern yang Harus Diganti:

### 1. Headers
```tsx
// BEFORE
<h2 className="text-3xl font-bold text-white">Title</h2>
<p className="text-white/70 mt-1">Description</p>

// AFTER
<h1 className="text-[40px] font-bold notion-heading leading-tight">Title</h1>
<p className="notion-text-secondary text-sm mt-2">Description</p>
<div className="border-b border-[#E9E9E7] dark:border-[#373737] my-6"></div>
```

### 2. Cards
```tsx
// BEFORE
<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">

// AFTER
<div className="notion-card p-6">
```

### 3. Buttons
```tsx
// BEFORE
<button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg">

// AFTER
<button className="notion-button-primary px-4 py-2">
```

### 4. Inputs
```tsx
// BEFORE
<input className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50">

// AFTER
<input className="notion-input">
```

### 5. Text
```tsx
// BEFORE
<p className="text-white">Text</p>
<p className="text-white/70">Secondary</p>

// AFTER
<p className="notion-text">Text</p>
<p className="notion-text-secondary">Secondary</p>
```

### 6. Stats Cards
```tsx
// BEFORE
<div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
  <p className="text-white/70 text-sm">Label</p>
  <p className="text-3xl font-bold text-white mt-1">Value</p>
</div>

// AFTER
<div className="notion-card p-4 hover:bg-[#F7F6F3] dark:hover:bg-[#252525] transition-colors">
  <p className="notion-text-secondary text-xs mb-2">Label</p>
  <p className="text-2xl font-bold notion-heading">Value</p>
</div>
```

### 7. Tabs
```tsx
// BEFORE
<button className={`px-6 py-3 rounded-lg font-semibold ${
  active ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white/10 text-white/70'
}`}>

// AFTER
<button className={`px-4 py-2 text-sm font-medium border-b-2 ${
  active ? 'border-[#2383E2] notion-text' : 'border-transparent notion-text-secondary'
}`}>
```

### 8. Search/Filter
```tsx
// BEFORE
<input className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50">

// AFTER
<input className="notion-input">
```

### 9. Empty States
```tsx
// BEFORE
<p className="text-white/70 text-lg">No data</p>

// AFTER
<p className="notion-text-secondary text-center py-8 text-sm">No data</p>
```

### 10. Modals
```tsx
// BEFORE
<div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20">

// AFTER
<div className="notion-card p-6 notion-shadow max-w-2xl">
```
