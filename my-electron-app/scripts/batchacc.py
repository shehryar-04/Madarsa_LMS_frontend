import pandas as pd

input_file = "E:\Madarsa LMS system\Frontend-react\my-electron-app\missing students.csv"
output_file = "students_clean.csv"

df = pd.read_csv(input_file)

# 1. student_type fix
df["student_type"] = "kutub"

# 2. convert dob_raw -> dob
def convert_date(d):
    if pd.isna(d):
        return None
    try:
        # assume dd/mm/yyyy or dd/mm/yy
        return pd.to_datetime(d, dayfirst=True).strftime("%m/%d/%Y")
    except:
        return None

df["dob"] = df["dob_raw"].apply(convert_date)

# 3. remove old column
df.drop(columns=["dob_raw"], inplace=True)

# 4. reorder columns for Supabase
columns_order = [
    "student_type",
    "serial_no",
    "entry_year",
    "name",
    "father_name",
    "dob",
    "class_level",
    "district",
    "address"
]

df = df[[c for c in columns_order if c in df.columns]]

# 5. save clean file
df.to_csv(output_file, index=False, encoding="utf-8")

print("Done:", output_file)