import React from "react";
import MegaOffers from "./MegaOffers";
import MegaOffersList from "./MegaOffersList";

function Offers({ activeForm }) {

  return (
    <div>

      {activeForm === "megaoffer" && (
        <MegaOffers activeForm={activeForm} />
      )}

      {activeForm === "megaoffer_list" && (
        <MegaOffersList activeForm={activeForm} />
      )}

    </div>
  );
}

export default Offers;