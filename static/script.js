const form = document.getElementById("insuranceForm");

const predictBtn = document.getElementById("predictBtn");
const btnText = document.getElementById("btnText");
const btnIcon = document.getElementById("btnIcon");

const loading = document.getElementById("loading");
const result = document.getElementById("result");
const predictionValue = document.getElementById("predictionValue");

const errorBox = document.getElementById("error");
const errorMessage = document.getElementById("errorMessage");


form.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Hide previous messages
    result.style.display = "none";
    errorBox.style.display = "none";


    // Get form values
    const age = Number(
        document.getElementById("age").value
    );

    const sex =
        document.getElementById("sex").value;

    const bmi = Number(
        document.getElementById("bmi").value
    );

    const children = Number(
        document.getElementById("children").value
    );

    const smoker =
        document.getElementById("smoker").value;

    const region =
        document.getElementById("region").value;


    // Create request data
    const requestData = {
        age: age,
        sex: sex,
        bmi: bmi,
        children: children,
        smoker: smoker,
        region: region
    };


    // Loading state
    predictBtn.disabled = true;

    btnText.textContent = "Predicting...";

    btnIcon.className =
        "fa-solid fa-spinner fa-spin";

    loading.style.display = "flex";


    try {

        // Send data to FastAPI
        const response = await fetch("/predict", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(requestData)
        });


        // Check HTTP response
        if (!response.ok) {

            let errorData;

            try {
                errorData = await response.json();
            } catch {
                errorData = null;
            }


            if (response.status === 404) {
                throw new Error(
                    "Prediction API not found. Please check the FastAPI deployment."
                );
            }


            if (response.status === 422) {
                throw new Error(
                    getErrorMessage(errorData)
                );
            }


            throw new Error(
                getErrorMessage(errorData)
            );
        }


        // Convert response to JSON
        const data = await response.json();


        // Check prediction exists
        if (
            data.predicted_insurance_charge === undefined
        ) {
            throw new Error(
                "Invalid response received from prediction server."
            );
        }


        // Get prediction
        const prediction =
            data.predicted_insurance_charge;


        // Show result
        predictionValue.textContent =
            "$" +
            Number(prediction).toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


        result.style.display = "flex";


    } catch (error) {

        console.error(
            "Prediction Error:",
            error
        );


        errorMessage.textContent =
            error.message ||
            "Unable to connect to the prediction server.";


        errorBox.style.display = "flex";


    } finally {

        // Reset loading state
        loading.style.display = "none";

        predictBtn.disabled = false;

        btnText.textContent =
            "Predict Insurance Cost";

        btnIcon.className =
            "fa-solid fa-arrow-right";
    }

});


// -----------------------------------------
// FastAPI validation error handler
// -----------------------------------------

function getErrorMessage(errorData) {

    if (!errorData || !errorData.detail) {
        return "Something went wrong.";
    }


    if (Array.isArray(errorData.detail)) {

        return errorData.detail
            .map(error => error.msg)
            .join(", ");
    }


    return errorData.detail;
}