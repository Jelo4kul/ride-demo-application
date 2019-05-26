
    const SEC_key="FLWSECK-ca9c4de4f322bcc8b3bc847c43312e3c-X";
    const API_publicKey = "FLWPUBK-6ea430b551c060a50ce65b0744c225c6-X";
    const SUB_account1 = "RS_3222912BADD48BD4C0C455B3BB5FA759";
    let customerEmail, customerPhoneNo, amountToPay, customerCurrency;
    let transactionRef, chargeResponse;

    function fetchCustomerBVN(){
      return document.getElementById("bvn").value;
    }

    function bvnValidation() {
      let customerBVN=fetchCustomerBVN();
      if(customerBVN.length == 11) {
        //create a httprequest
        fetch("https://ravesandboxapi.flutterwave.com/v2/kyc/bvn/"+customerBVN+"?seckey="+SEC_key, {
          method: 'GET'
        })
          .then(response => response.json())
          .then(jsonObj => {
            alert("BVN successfully verified");

            //submit the form
            document.getElementById("form1").submit();
            return true;
          })
          .catch(error => console.error('Error:', error));

         //false is returned here to prevent the next page from loading while the interaction with the api hasn't ended
         return false;
       } else {
         alert("bvn must have 11 digits");
         return false;
       }
     }

     function generateTransactionID() {
       //this function uses the Universally Unique Identifier (UUID) logic by MIT
       return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
         var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
         return v.toString(16);
       });
     }

     //TODO: verify the customer's input
     function validateCustomerEntries(customerEmail, customerPhoneNo) {
       return true;
     }


     //TODO: verify the customer's input
     function validateCustomerEntries(customerEmail, customerPhoneNo, amountToPay) {
       return true;
     }

     function isCustomerDetailCorrect() {
       //TODO: create a customer object
      customerEmail = document.getElementById("email").value;
      customerPhoneNo = document.getElementById("phoneNo").value;
      amountToPay = document.getElementById("amount").value;
      let currencyID = document.getElementById("currency");
      customerCurrency = currencyID.options[currencyID.selectedIndex].value;

      return validateCustomerEntries(customerEmail, customerPhoneNo, amountToPay);
    }


    function payWithRave() {
        if( !isCustomerDetailCorrect() ) {
          return;
        }
        var x = getpaidSetup({
            PBFPubKey: API_publicKey,
            customer_email: customerEmail,
            amount: amountToPay,
            customer_phone: customerPhoneNo,
            currency: customerCurrency,
            txref: generateTransactionID(),
            subaccounts: [
            {
              id: SUB_account1
            }
          ],
            meta: [{
                metaname: "paymentID",
                metavalue: "2567"
            }],
            onclose: function() {},
            callback: function(response) {
                transactionRef = response.tx.txRef;
                document.getElementById("hiddenTxRef").value = transactionRef;
                chargeResponse = response.tx.chargeResponseCode;

                if (
                    response.tx.chargeResponseCode == "00" ||
                    response.tx.chargeResponseCode == "0"
                ) {
                    // redirect to a success page
                    window.location = "file:///C:/Users/Jelo/Desktop/FlutterWave%20App/paymentstatus.html?txref=" + transactionRef +"&amount="+amountToPay + "&currencies=" +customerCurrency;
                    return true;
                } else {
                    // redirect to a failure page.
                    alert("Payment failed. Please try again");
                    return false;
                }

                x.close(); // use this to close the modal immediately after payment.
            }
        });
        return false;
    }

    function verifyPayment() {
      //retrieve the query paramaters(txref, amount, currencies) from the Url
      let urlParams = new URLSearchParams(window.location.search);
      let transactionRef = urlParams.get("txref");
      let amountPaid = urlParams.get("amount");
      let customerCurrency = urlParams.get("currencies");

      let url = 'https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/v2/verify';
      let payload = {
        "SECKEY": SEC_key,
        "txref": transactionRef
      };

      fetch(url, {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(payload), // payload is converted to string so it can't be sent to server
        headers:{
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
      .then(response => {
        console.log(response);
        //check if status is successful.
        if (response.data.status === "successful" && response.data.chargecode == 00) {

            //check if the amount is same as amount you wanted to charge just to be very sure
            if (response.data.amount == amountPaid && response.data.currency == customerCurrency) {
                console.log("Payment successful");

                //update the merchant_commission and driver's earning
                let splitInfo = JSON.parse(response.data.meta[2].metavalue)[SUB_account1];
                document.getElementById("drvEarn").innerHTML = splitInfo.subaccount_earning;
                document.getElementById("merchComsn").innerHTML = splitInfo.merchant_commission;

            }
        }

      })
      .catch(error => console.error('Error:', error));
    }

    function switchTab() {
      if(validateCustomerEntries()) {
        document.getElementById("sec-tab").click();
      }

    }
