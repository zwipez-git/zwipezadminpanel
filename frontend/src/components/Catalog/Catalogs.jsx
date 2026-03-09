import React, { useEffect, useState } from "react";
import CategoryList from "./CategoryList";
import ProductList from "./ProductList";
import BannerList from "./BannerList";



const API_BASE_URL = import.meta.env.VITE_API_URL;

function Catalogs({ activeForm, setActiveForm, setActiveView}) {
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get-categories`)
      .then(res => res.json())
      .then(setCategories);
  }, []);

  return (
    <div>
      {activeForm === "category_list" && <CategoryList />}

      {activeForm === "product_list" && (
        <ProductList
          categories={categories}
          setActiveForm={setActiveForm}
           setActiveView={setActiveView}
        />
      )}

      {activeForm === "banner_list" && <BannerList />}
    </div>
  );
}

export default Catalogs;