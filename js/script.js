"use strict";

/* =========================================================
   TPEG KIDDIES STORE
   MAIN JAVASCRIPT

   Features:
   - Package selection
   - Order calculation
   - Order validation
   - EmailJS order submission
   - Meta Pixel tracking
   - TikTok Pixel tracking
   - Smooth scrolling
   - Order success screen
========================================================= */


/* =========================================================
   1. PRODUCT CONFIGURATION
========================================================= */

const PRODUCT = {
    name: "TPEG Kiddies Learning Kit",
    currency: "NGN",

    packages: {
        1: {
            name: "Regular",
            quantity: 1,
            price: 29500
        },

        2: {
            name: "Smart",
            quantity: 2,
            price: 55000
        },

        3: {
            name: "School",
            quantity: 3,
            price: 82000
        }
    }
};


/* =========================================================
   2. EMAILJS CONFIGURATION
========================================================= */

const EMAILJS_CONFIG = {
    publicKey: "BpmEAlP0p5CfXByOA",
    serviceId: "service_f876y0m",
    templateId: "template_1kqytul"
};


/* =========================================================
   3. TIKTOK PIXEL CONFIGURATION
========================================================= */

const TIKTOK_PIXEL_ID = "DAMK8UBC77U1ARFV5U8G";


/* =========================================================
   4. DOM ELEMENTS
========================================================= */

const orderForm =
    document.getElementById("orderForm");

const orderTotal =
    document.getElementById("orderTotal");

const formOrderTotal =
    document.getElementById("formOrderTotal");

const selectedPackageText =
    document.getElementById("selectedPackageText");

const customerName =
    document.getElementById("customerName");

const customerPhone =
    document.getElementById("customerPhone");

const deliveryAddress =
    document.getElementById("deliveryAddress");

const quantityInputs =
    document.querySelectorAll(
        'input[name="quantity"]'
    );

const submitButton =
    orderForm?.querySelector(
        ".submit-button"
    );

const packageButtons =
    document.querySelectorAll(
        ".package-order-btn"
    );


/* =========================================================
   5. CURRENCY FORMATTER
========================================================= */

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }
    ).format(amount);
}


/* =========================================================
   6. GET SELECTED PACKAGE
========================================================= */

function getSelectedPackage() {

    const selected =
        document.querySelector(
            'input[name="quantity"]:checked'
        );

    const quantity =
        selected
            ? Number(selected.value)
            : 1;

    return (
        PRODUCT.packages[quantity] ||
        PRODUCT.packages[1]
    );
}


/* =========================================================
   7. UPDATE ORDER TOTAL
========================================================= */

function updateOrderTotal() {

    const selectedPackage =
        getSelectedPackage();

    const formatted =
        formatCurrency(
            selectedPackage.price
        );

    if (orderTotal) {

        orderTotal.textContent =
            formatted;
    }

    if (formOrderTotal) {

        formOrderTotal.textContent =
            formatted;
    }

    if (selectedPackageText) {

        selectedPackageText.textContent =
            `${selectedPackage.name} Package`;
    }
}


/* =========================================================
   8. PHONE NORMALISATION
========================================================= */

function normalisePhone(phone) {

    let value =
        String(phone || "")
            .trim()
            .replace(/[\s\-().]/g, "");


    /*
        Nigerian local format:

        08012345678

        becomes:

        +2348012345678
    */

    if (/^0\d{10}$/.test(value)) {

        value =
            "+234" +
            value.substring(1);
    }


    /*
        Nigerian international format:

        2348012345678

        becomes:

        +2348012345678
    */

    if (/^234\d{10}$/.test(value)) {

        value =
            "+" + value;
    }


    return value;
}


/* =========================================================
   9. PHONE VALIDATION
========================================================= */

function isValidNigerianPhone(phone) {

    const normalised =
        normalisePhone(phone);

    return /^(?:\+234)(70|71|80|81|90|91)\d{8}$/
        .test(normalised);
}


/* =========================================================
   10. FIELD ERROR
========================================================= */

function showFieldError(
    field,
    message
) {

    if (!field) {
        return;
    }

    clearFieldError(field);

    field.setAttribute(
        "aria-invalid",
        "true"
    );

    const error =
        document.createElement("small");

    error.className =
        "field-error";

    error.textContent =
        message;

    error.setAttribute(
        "role",
        "alert"
    );

    const parent =
        field.closest(".form-group");

    parent?.appendChild(error);
}


/* =========================================================
   11. CLEAR FIELD ERROR
========================================================= */

function clearFieldError(field) {

    if (!field) {
        return;
    }

    field.removeAttribute(
        "aria-invalid"
    );

    const parent =
        field.closest(".form-group");

    const existingError =
        parent?.querySelector(
            ".field-error"
        );

    existingError?.remove();
}


/* =========================================================
   12. GLOBAL FORM MESSAGE
========================================================= */

function showGlobalMessage(
    message,
    type = "success"
) {

    document
        .querySelector(
            ".form-message"
        )
        ?.remove();

    const messageElement =
        document.createElement("div");

    messageElement.className =
        `form-message ${type}`;

    messageElement.setAttribute(
        "role",
        type === "error"
            ? "alert"
            : "status"
    );

    messageElement.textContent =
        message;

    if (orderForm) {

        orderForm.prepend(
            messageElement
        );
    }
}


/* =========================================================
   13. VALIDATE ORDER FORM
========================================================= */

function validateOrderForm() {

    let isValid = true;

    document
        .querySelector(
            ".form-message"
        )
        ?.remove();


    /* NAME */

    const name =
        customerName?.value.trim();

    if (!name) {

        showFieldError(
            customerName,
            "Please enter your full name."
        );

        isValid = false;

    } else if (name.length < 2) {

        showFieldError(
            customerName,
            "Please enter a valid name."
        );

        isValid = false;
    }


    /* PHONE */

    const phone =
        customerPhone?.value.trim();

    if (!phone) {

        showFieldError(
            customerPhone,
            "Please enter your phone or WhatsApp number."
        );

        isValid = false;

    } else if (
        !isValidNigerianPhone(phone)
    ) {

        showFieldError(
            customerPhone,
            "Please enter a valid Nigerian phone number."
        );

        isValid = false;
    }


    /* DELIVERY ADDRESS */

    const address =
        deliveryAddress?.value.trim();

    if (!address) {

        showFieldError(
            deliveryAddress,
            "Please enter your delivery address."
        );

        isValid = false;

    } else if (address.length < 10) {

        showFieldError(
            deliveryAddress,
            "Please enter a more complete delivery address."
        );

        isValid = false;
    }


    /* PACKAGE */

    const selectedQuantity =
        document.querySelector(
            'input[name="quantity"]:checked'
        );

    if (!selectedQuantity) {

        showGlobalMessage(
            "Please select a package.",
            "error"
        );

        isValid = false;
    }


    if (!isValid) {

        showGlobalMessage(
            "Please check the highlighted fields and try again.",
            "error"
        );
    }


    return isValid;
}


/* =========================================================
   14. COLLECT ORDER DATA
========================================================= */

function getOrderData() {

    const selectedPackage =
        getSelectedPackage();

    const rawPhone =
        customerPhone?.value.trim() || "";

    const phone =
        normalisePhone(rawPhone);

    return {

        product:
            PRODUCT.name,

        package:
            selectedPackage.name,

        quantity:
            selectedPackage.quantity,

        total:
            selectedPackage.price,

        formattedTotal:
            formatCurrency(
                selectedPackage.price
            ),

        customerName:
            customerName?.value.trim() || "",

        phone,

        deliveryAddress:
            deliveryAddress?.value.trim() || "",

        currency:
            PRODUCT.currency,

        orderDate:
            new Date().toLocaleString(
                "en-NG",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            ),

        source:
            "TPEG Kiddies Landing Page"
    };
}


/* =========================================================
   15. EMAILJS INITIALISATION
========================================================= */

function initialiseEmailJS() {

    if (
        typeof window.emailjs === "undefined"
    ) {

        console.error(
            "EmailJS SDK was not loaded."
        );

        return false;
    }


    try {

        window.emailjs.init({
            publicKey:
                EMAILJS_CONFIG.publicKey
        });

        console.log(
            "EmailJS initialised successfully."
        );

        return true;

    } catch (error) {

        console.error(
            "EmailJS initialisation failed:",
            error
        );

        return false;
    }
}


/* =========================================================
   16. BUILD EMAILJS ORDER DATA
========================================================= */

function buildEmailJSOrderData() {

    const order =
        getOrderData();

    return {

        customer_name:
            order.customerName,

        phone:
            order.phone,

        address:
            order.deliveryAddress,

        package:
            order.package,

        package_price:
            order.total.toLocaleString(
                "en-NG"
            ),

        quantity:
            order.quantity,

        total:
            order.total.toLocaleString(
                "en-NG"
            ),

        source:
            order.source,

        order_date:
            order.orderDate
    };
}


/* =========================================================
   17. SEND ORDER WITH EMAILJS
========================================================= */

async function sendOrderWithEmailJS() {

    if (
        typeof window.emailjs === "undefined"
    ) {

        throw new Error(
            "EmailJS is not available."
        );
    }


    const orderData =
        buildEmailJSOrderData();


    const response =
        await window.emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            orderData
        );


    return response;
}


/* =========================================================
   18. META PIXEL
========================================================= */

function trackMetaPixel(
    eventName,
    data = {}
) {

    if (
        typeof window.fbq === "function"
    ) {

        window.fbq(
            "track",
            eventName,
            data
        );

        console.log(
            `Meta Pixel: ${eventName}`,
            data
        );
    }
}


/* =========================================================
   19. TIKTOK PIXEL
========================================================= */

function trackTikTok(
    eventName,
    data = {}
) {

    if (
        typeof window.ttq !== "undefined" &&
        typeof window.ttq.track === "function"
    ) {

        window.ttq.track(
            eventName,
            data
        );

        console.log(
            `TikTok Pixel: ${eventName}`,
            data
        );
    }
}


/* =========================================================
   20. VIEW CONTENT
========================================================= */

function trackViewContent() {

    const selectedPackage =
        PRODUCT.packages[1];

    const data = {

        content_name:
            PRODUCT.name,

        content_category:
            "Kids Educational Product",

        content_type:
            "product",

        value:
            selectedPackage.price,

        currency:
            PRODUCT.currency
    };


    /* Meta */

    trackMetaPixel(
        "ViewContent",
        data
    );


    /* TikTok */

    trackTikTok(
        "ViewContent",
        {

            content_id:
                "tpeg-kiddies-learning-kit",

            content_name:
                PRODUCT.name,

            content_category:
                "Kids Educational Product",

            content_type:
                "product",

            value:
                selectedPackage.price,

            currency:
                PRODUCT.currency
        }
    );
}


/* =========================================================
   21. INITIATE CHECKOUT
========================================================= */

let checkoutTracked = false;


function trackInitiateCheckout() {

    if (checkoutTracked) {
        return;
    }

    const selectedPackage =
        getSelectedPackage();

    if (!selectedPackage) {
        return;
    }

    checkoutTracked = true;


    const total =
        selectedPackage.price;


    /* Meta */

    trackMetaPixel(
        "InitiateCheckout",
        {

            content_name:
                PRODUCT.name,

            content_category:
                "Kids Educational Product",

            content_ids: [
                selectedPackage.name
            ],

            content_type:
                "product",

            value:
                total,

            currency:
                PRODUCT.currency,

            num_items:
                selectedPackage.quantity
        }
    );


    /* TikTok */

    trackTikTok(
        "InitiateCheckout",
        {

            content_id:
                selectedPackage.name,

            content_name:
                PRODUCT.name,

            content_category:
                "Kids Educational Product",

            content_type:
                "product",

            quantity:
                selectedPackage.quantity,

            value:
                total,

            currency:
                PRODUCT.currency
        }
    );
}


/* =========================================================
   22. LEAD / ORDER SUBMITTED
========================================================= */

function trackLead() {

    const selectedPackage =
        getSelectedPackage();

    if (!selectedPackage) {
        return;
    }


    const total =
        selectedPackage.price;


    /* Meta */

    trackMetaPixel(
        "Lead",
        {

            content_name:
                PRODUCT.name,

            content_category:
                "Order",

            package:
                selectedPackage.name,

            value:
                total,

            currency:
                PRODUCT.currency
        }
    );


    /* TikTok */

    trackTikTok(
        "SubmitForm",
        {

            content_id:
                selectedPackage.name,

            content_name:
                PRODUCT.name,

            content_category:
                "Order",

            quantity:
                selectedPackage.quantity,

            value:
                total,

            currency:
                PRODUCT.currency
        }
    );
}


/* =========================================================
   23. META PURCHASE
========================================================= */

/*
    IMPORTANT:

    This function is intentionally NOT called when the
    EmailJS order is submitted.

    Your store uses Payment on Delivery.

    Therefore:

    Order submitted ≠ Purchase completed.

    Fire Purchase only when you have a confirmed
    completed/paid order.
*/

function trackPurchase() {

    const selectedPackage =
        getSelectedPackage();

    if (!selectedPackage) {
        return;
    }


    const total =
        selectedPackage.price;


    trackMetaPixel(
        "Purchase",
        {

            content_name:
                PRODUCT.name,

            content_category:
                "Kids Educational Product",

            content_ids: [
                selectedPackage.name
            ],

            content_type:
                "product",

            value:
                total,

            currency:
                PRODUCT.currency,

            num_items:
                selectedPackage.quantity
        }
    );
}


/* =========================================================
   24. TIKTOK COMPLETE PAYMENT
========================================================= */

function trackTikTokPurchase() {

    const selectedPackage =
        getSelectedPackage();

    if (!selectedPackage) {
        return;
    }


    const total =
        selectedPackage.price;


    trackTikTok(
        "CompletePayment",
        {

            content_id:
                selectedPackage.name,

            content_name:
                PRODUCT.name,

            content_category:
                "Kids Educational Product",

            content_type:
                "product",

            quantity:
                selectedPackage.quantity,

            value:
                total,

            currency:
                PRODUCT.currency
        }
    );
}


/* =========================================================
   25. SUBMIT BUTTON LOADING
========================================================= */

function setSubmitLoading(loading) {

    if (!submitButton) {
        return;
    }


    if (loading) {

        submitButton.disabled =
            true;

        submitButton.dataset.originalText =
            submitButton.innerHTML;

        submitButton.textContent =
            "Processing Order...";

        submitButton.setAttribute(
            "aria-busy",
            "true"
        );

        submitButton.style.opacity =
            "0.75";

        submitButton.style.cursor =
            "wait";

    } else {

        submitButton.disabled =
            false;

        submitButton.innerHTML =
            submitButton.dataset.originalText ||
            "Complete My Order →";

        submitButton.removeAttribute(
            "aria-busy"
        );

        submitButton.style.opacity =
            "";

        submitButton.style.cursor =
            "";
    }
}


/* =========================================================
   26. ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /[&<>"']/g,
            (character) => {

                const entities = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                };

                return entities[character];
            }
        );
}


/* =========================================================
   27. SUCCESS SCREEN
========================================================= */

function showOrderSuccess(order) {

    document
        .querySelector(
            ".form-message"
        )
        ?.remove();


    const success =
        document.createElement("div");


    success.className =
        "order-success";


    success.setAttribute(
        "role",
        "status"
    );


    success.setAttribute(
        "aria-live",
        "polite"
    );


    success.innerHTML = `

        <div class="success-icon">
            ✓
        </div>

        <h3>
            Order Received! 🎉
        </h3>

        <p>
            Thank you,
            <strong>
                ${escapeHTML(order.customerName)}
            </strong>.
        </p>

        <p>
            Your
            <strong>
                ${escapeHTML(order.package)}
            </strong>
            package has been recorded.
        </p>

        <p>
            Order total:
            <strong>
                ${escapeHTML(order.formattedTotal)}
            </strong>
        </p>

        <p>
            We'll contact you on
            <strong>
                ${escapeHTML(order.phone)}
            </strong>
            to confirm your order before dispatch.
        </p>

        <p>
            Please be ready to receive your order
            within the next 3 days.
        </p>

        <button
            type="button"
            class="btn btn-primary"
            id="newOrderButton"
        >
            Make Another Order
        </button>
    `;


    if (!orderForm) {
        return;
    }


    orderForm.innerHTML = "";

    orderForm.appendChild(
        success
    );


    document
        .getElementById(
            "newOrderButton"
        )
        ?.addEventListener(
            "click",
            () => {

                window.location.reload();

            }
        );
}


/* =========================================================
   28. ORDER SUBMISSION
========================================================= */

let isSubmitting = false;


orderForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (isSubmitting) {
            return;
        }


        /* Validate */

        const valid =
            validateOrderForm();


        if (!valid) {
            return;
        }


        /* Get order */

        const order =
            getOrderData();


        isSubmitting =
            true;


        setSubmitLoading(
            true
        );


        try {

            /* =============================================
               SEND ORDER THROUGH EMAILJS
            ============================================= */

            await sendOrderWithEmailJS();


            /* =============================================
               TRACK SUCCESSFUL ORDER SUBMISSION
            ============================================= */

            /*
                Because this is Payment on Delivery,
                we track the submitted order as a Lead.

                We do NOT fire Purchase here because
                payment has not happened yet.
            */

            trackLead();


            /* =============================================
               SHOW SUCCESS
            ============================================= */

            showOrderSuccess(
                order
            );


            document
                .querySelector(
                    ".order-form-wrapper"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


        } catch (error) {

            console.error(
                "Order submission error:",
                error
            );


            showGlobalMessage(
                "We could not submit your order right now. Please check your internet connection and try again.",
                "error"
            );


        } finally {

            isSubmitting =
                false;


            if (
                document.body.contains(
                    submitButton
                )
            ) {

                setSubmitLoading(
                    false
                );
            }
        }
    }
);


/* =========================================================
   29. PACKAGE SELECTION
========================================================= */

quantityInputs.forEach(
    (input) => {

        input.addEventListener(
            "change",
            () => {

                updateOrderTotal();

                /*
                    Changing package is an order
                    interaction, but InitiateCheckout
                    is tracked only once.
                */

                trackInitiateCheckout();
            }
        );
    }
);


/* =========================================================
   30. PACKAGE CTA BUTTONS
========================================================= */

packageButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const quantity =
                    button.dataset.package;


                const matchingInput =
                    document.querySelector(
                        `input[name="quantity"][value="${quantity}"]`
                    );


                if (!matchingInput) {
                    return;
                }


                matchingInput.checked =
                    true;


                updateOrderTotal();


                trackInitiateCheckout();


                const orderSection =
                    document.querySelector(
                        "#order"
                    );


                if (orderSection) {

                    orderSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });


                    setTimeout(
                        () => {
                            customerName?.focus();
                        },
                        600
                    );
                }
            }
        );
    }
);


/* =========================================================
   31. CTA SCROLLING
========================================================= */

document
    .querySelectorAll(
        'a[href="#order"], a[href="#packages"]'
    )
    .forEach(
        (link) => {

            link.addEventListener(
                "click",
                (event) => {

                    /*
                        Package buttons already have their
                        own click handler.
                    */

                    if (
                        link.classList.contains(
                            "package-order-btn"
                        )
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            link.getAttribute("href")
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });


                    if (
                        link.getAttribute("href") ===
                        "#order"
                    ) {

                        trackInitiateCheckout();


                        setTimeout(
                            () => {
                                customerName?.focus();
                            },
                            600
                        );
                    }
                }
            );
        }
    );


/* =========================================================
   32. YOUTUBE VIDEO
========================================================= */

const productVideo =
    document.querySelector(
        ".demo-video iframe"
    );


if (productVideo) {

    productVideo.setAttribute(
        "loading",
        "lazy"
    );
}


/* =========================================================
   33. PHONE INPUT CLEANUP
========================================================= */

customerPhone?.addEventListener(
    "input",
    () => {

        customerPhone.value =
            customerPhone.value.replace(
                /[^0-9+\s()-]/g,
                ""
            );


        clearFieldError(
            customerPhone
        );
    }
);


/* =========================================================
   34. NAME INPUT CLEANUP
========================================================= */

customerName?.addEventListener(
    "input",
    () => {

        customerName.value =
            customerName.value.replace(
                /^\s+/,
                ""
            );


        clearFieldError(
            customerName
        );
    }
);


/* =========================================================
   35. ADDRESS INPUT CLEANUP
========================================================= */

deliveryAddress?.addEventListener(
    "input",
    () => {

        deliveryAddress.value =
            deliveryAddress.value.replace(
                /^\s+/,
                ""
            );


        clearFieldError(
            deliveryAddress
        );
    }
);


/* =========================================================
   36. FORM START TRACKING
========================================================= */

let formStarted = false;


[
    customerName,
    customerPhone,
    deliveryAddress
].forEach(
    (field) => {

        field?.addEventListener(
            "focus",
            () => {

                if (formStarted) {
                    return;
                }


                formStarted =
                    true;


                console.log(
                    "TPEG Kiddies: Order form started."
                );


                /*
                    Meta InitiateCheckout is fired once
                    when the customer begins interacting
                    with the order process.
                */

                trackInitiateCheckout();

            },
            {
                once: true
            }
        );
    }
);


/* =========================================================
   37. INITIALISE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
            Initialise EmailJS
        */

        initialiseEmailJS();


        /*
            Initial order total
        */

        updateOrderTotal();


        /*
            Track product view
        */

        trackViewContent();


        console.log(
            "TPEG Kiddies Store loaded successfully."
        );
    }
);