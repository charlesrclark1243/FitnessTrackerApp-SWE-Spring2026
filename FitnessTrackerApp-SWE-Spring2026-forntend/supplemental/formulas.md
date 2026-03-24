# Supplemental Material - Metric Formulas

## Body Mass Index (BMI)

 - `m` is mass in kilograms (kg)
 - `h` is height in meters (m)
 - `bmi` is body mass index (BMI) in kg / m**2

```
bmi = m / (h ** 2)
```

### Pounds (lbs) to Kilograms (kg)
 - `m_lbs` is mass in pounds (lbs)


```
m = 0.453592 * m_lbs
```

### Feet (ft) and Inches (in) to Meters (m)
 - `h_imperial = f'i"`
   - `f` is feet (ft)
   - `i` is inches (in)

```
h = 0.3048 * f + 0.0254 * i
```

## Body Fat Percentage (BFP) Estimate - Deurenberg Formula
 - `bmi` is BMI in kg / m**2
 - `age` is age in years
 - `sex` is sex (1 for male, 0 for female)

### For Those Older than 15

```
bfp = 1.20 * bmi + 0.23 * age - 10.8 * sex - 5.4
```

### For Those 15 and Younger

```
bfp = 1.51 * bmi - 0.70 * age - 3.6 * sex + 1.4 
```

### Brithday-to-Today Comparison, to Number of Days, to Number of Years

See this link: [https://chatgpt.com/share/6973ec39-0a78-800b-98a2-c92ca996d1a0](https://chatgpt.com/share/6973ec39-0a78-800b-98a2-c92ca996d1a0)



