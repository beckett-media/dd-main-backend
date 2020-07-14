/**
 * Test routes for testing ebay auth.
 */
const got = require("got");
const express = require("express");
const router = express.Router();
const SimpleLogger = require("../utils/simpleLogger");

const ebay_oauth_token = `v^1.1#i^1#I^3#p^1#r^0#f^0#t^H4sIAAAAAAAAAOVYa2wUVRTu9qUVikpQsSIuI4ZIM7Mzs4/ZnbBLtg9gsdDCroUWFO7O3Gmn3Z2ZzL1Dd6vGprxC+AH+IARjEDWYioKaEC0oSEKUkGqipmDwR5UfRKKQxhjjK0HvTJfSVgKFLrGJ+2dyzz3n3HO+c849Zy/bVVo2f8uSLb+Vu+4q3NfFdhW6XNwUtqy0pHJaUWFFSQE7gsG1r2tuV3F30cUFCKRThrgSIkPXEHRn0ikNiQ4xTFmmJuoAqUjUQBoiEUtiPLqsTuQZVjRMHeuSnqLcsZowJfgDLFC8As8ByAY4nlC1qzoTepgiRH+IlUJCiPPxCgyRfYQsGNMQBhoOUzzLszQr0JwvwfMiz4leL+MP8M2UuxGaSNU1wsKwVMQxV3RkzRG23thUgBA0MVFCRWLRRfH6aKymdnligWeErkgOhzgG2EKjV9W6DN2NIGXBGx+DHG4xbkkSRIjyRIZOGK1UjF415jbMd6BWvDAg+JOhIAhIHKdweYFykW6mAb6xHTZFlWnFYRWhhlWcvRmiBI1kG5RwbrWcqIjVuO3PCgukVEWFZpiqrYo2RRsaqEhUs0zQElfpmurFcTpetZoGUhBKgsJCOsQLHCvLUu6QIU05iMecUq1rsmoDhtzLdVwFicVwLC7cCFwIU71Wb0YVbFszzOdPsOxV/PxCsx3QoQhauFWzYwrTBAS3s7w5+sPSGJtq0sJwWMPYDQeeMAUMQ5WpsZtOHuZSJ4PCVCvGhujxdHR0MB1eRjdbPDzLcp7Vy+riUitMAyrHa9d6Bqk3F6BVxxUJEkmkijhrEFsyJE+JAVoLFfH6gpw/kMN9tFmRsdR/EUb47BldDfmqjpAkSMFAUAr5gRIMBuR8VEckl6Ae2w6YBFk6Dcx2iI0UkCAtkTyz0tBUZdHrV3hvUIG0HAgptC+kKHTSLwdoToGQhTCZlELB/0uRjDfN41AyIc5bnuclx5/KNgXakqF4tNls0oAi+NsrfW0JFO8EcUNpidZarWzTUq4ZrBJi4fFWwvWdl3QDNugpVcrmEQG71vNR6abcAEycrbKyZB2HqRT5TMhdZLs7uUJtyyOiABgqY5c2I+lpjw7InW6T1jkWu8fD5ElaWabFgggTK2TSUsctpJL6YMgNIY9fZOj+IQ6MX4TMa7Il4ds6yLnoGIKk2tKK0S2dmRkFyoSyJ2oYsXTawiCZgrH8dcb/oCte1z2VzIy37pNd63fQLxLZoRCr8tDAxzhxZtAGiTEh0i2TzLpMvT0DJfR2qJGugk09lYJmIzfhYE+yGN9C4709n/M78U2WvJZSKkmddZPNszseTRXke6op7nZtnaDXnD/kEwJ+PuSdkG/VTkwT2cnWzZfoCEP5Dvw58Yx+JokUOD+u23WM7XYdKXS5WIGluUr2ydKip4uLplKINHUGAU1O6hlGBQpDWqcGsGVCph1mDaCahaUu9dt+6fcRDzT7nmFnDj/RlBVxU0a817Czru2UcPc+VE6AETgfz/Oc19vMPn5tt5h7sHhG37Hzsx/4pmfvl3e/dXFt49YXPIOPDbDlw0wuV0kByaYCuPbVZ3/s/fCdnroX/z65u1Po275t4QffqS/XHjfee6TnDH+8bOP0il/hof73O1FhW2L+5ueL1q9aOrX6/v0Fx+uvVKhbBs8fhEdjay5/9Ok9yIt+BuLOjf0nz10+2rvu6/6+xX3gcGdwZvv0s7tOXOKWZA73Pmy1vD24snePtGnFF/H1JX0XurwH6/48wJ+dvX/zbGnWnMpth94cmH7ul4GC0xtOXdk+L52dwVoLp819qfz7N16Zs8lTu4Gidl8YNLfSDY+CihWedy1/5o8Fn1x6Ysdn82ORj/ce4E+fmbbpzNxDPT/MO3Ffg3fZyYHBrz5f2Qg2Hnl9b9+pBrBH+uu1nUeeWx/+6cLALrBmKIz/AK800/s6EwAA`;

router.get("/ebay-accepted", async (req, res) => {
  SimpleLogger.info(req.query.code, req.query.expires_id);
  try {
    const { body } = await got.post(
      "https://api.sandbox.ebay.com/identity/v1/oauth2/token",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${ebay_oauth_token}`,
        },
        form: {
          grant_type: "authorization_code",
          code: req.query.code,
          redirect_uri: "Anurag_Singla-AnuragSi-DCGS-S-sqsppiy",
        },
        responseType: "json",
      }
    );
    SimpleLogger.info(body.data);
  } catch (error) {
    SimpleLogger.error(error);
  }

  return res.send("Accepted");
});

router.get("/ebay-declined", (req, res) => {
  SimpleLogger.info(req.query.code, req.query.expires_id);
  return res.send("Declined");
});

module.exports = router;
