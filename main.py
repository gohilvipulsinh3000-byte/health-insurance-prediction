import joblib
import pandas as pd

from fastapi import FastAPI,Request
from pydantic import BaseModel, Field
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


app = FastAPI(
    title="Health Insurance Prediction API",
    description="Predict health insurance charges using Machine Learning"
)

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load trained model
model = joblib.load("model/insurance_model.pkl")


# Pydantic Request Body
class InsuranceData(BaseModel):

    age: int = Field(
        ...,
        ge=18,
        le=100
    )

    sex: Literal["male", "female"]

    bmi: float = Field(
        ...,
        gt=0,
        le=70
    )

    children: int = Field(
        ...,
        ge=0,
        le=20
    )

    smoker: Literal["yes", "no"]

    region: Literal[
        "southwest",
        "southeast",
        "northwest",
        "northeast"
    ]


@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )


@app.post("/predict")
def predict_insurance(data: InsuranceData):

    # Convert input into Pandas DataFrame
    input_data = pd.DataFrame([{
        "age": data.age,
        "sex": data.sex,
        "bmi": data.bmi,
        "children": data.children,
        "smoker": data.smoker,
        "region": data.region
    }])

    # Prediction
    prediction = model.predict(input_data)[0]

    return {
        "predicted_insurance_charge": round(
            float(prediction),
            2
        )
    }
