# Zalihe krvi u Republici Hrvatskoj - Scrapper

Scrapper je jednostavna Node applikacija za dohvaćanje vrijednosti krvi sa izvora. Razlog ne korištenja
- [Scrapy](https://www.scrapy.org/)
- [crawlee](https://crawlee.dev/)

je jednostavnost i ne postojanje potrebe za naprednim funkcionalnostima koje nule gore navedeni alati.

### Struktura podataka za lokaciju

```JSON
{
    "name": string,
    "address": {
        "street": string,
        "city": string,
        "postalCode": number
    },
    "website": string,
    "dataUrl": string,
    "bloodGroups": [] // Struktura pojedinog elementa je opisana niže
}

```

### Struktura podataka za krvnu grupu

```JSON
{
    "type": "A+|A-|B+|B-|AB+|AB-|0+|0-",
    "amount": int, // Number of available doses
    "max": int, // Number of maximum dose storage capacity
    "high": int, // Number of dosages we consider a high capacity based on usage
    "low": int, // Number of dosages we consider a low capacity based on usage
    "highPercentage": int, // Percentage ratio over max capacity
    "lowPercentage": int, // Percentage ratio over max capacity
    "amountPercentage": int // Percentage ratio over max capacity
}
```