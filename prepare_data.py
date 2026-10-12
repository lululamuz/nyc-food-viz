# Turns the raw NYC Open Data CSV into the small data.json used by the site.
# Usage: python prepare_data.py NYCFoodInspectionSimple.csv
import sys, json
import pandas as pd

df = pd.read_csv(sys.argv[1], dtype=str)

# The raw file has one row per inspection/violation, so keep one row per restaurant
r = df.drop_duplicates(["DBA", "STREET", "ZIPCODE"])
r = r[r["CUISINE DESCRIPTION"].notna()]
boroughs = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]
r = r[r["BORO"].isin(boroughs)]
r = r.assign(c=r["CUISINE DESCRIPTION"]
             .str.replace("Juice, Smoothies, Fruit Salads", "Juice & Smoothies")
             .str.replace("Bakery Products/Desserts", "Bakery & Desserts"))

def summarize(name, sub):
    counts = sub["c"].value_counts()
    return {
        "name": name,
        "totalRestaurants": int(len(sub)),
        "distinctCuisines": int(counts.size),
        "top": [{"cuisine": k, "count": int(v)} for k, v in counts.head(10).items()],
        "otherCount": int(counts.iloc[10:].sum()),
    }

out = {
    "source": "NYC Open Data — NYCFoodInspectionSimple (sfd3-axrg), downloaded 2026-10-11",
    "note": "Each restaurant counted once (unique name + street + ZIP). Restaurants without a cuisine listed are excluded.",
    "boroughs": [summarize("All NYC", r)] + [summarize(b, r[r["BORO"] == b]) for b in boroughs],
}
json.dump(out, open("data.json", "w"), indent=2)
print("wrote data.json")
