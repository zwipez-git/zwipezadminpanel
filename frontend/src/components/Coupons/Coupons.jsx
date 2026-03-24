import CouponsList from './CouponsList'
import UploadCoupons from './UploadCoupon'
function Coupons({ activeForm }) {

  return (
    <div>

      {activeForm === "uploadcoupons" && (
        <UploadCoupons activeForm={activeForm} />
      )}

      {activeForm === "coupons_list" && (
        <CouponsList activeForm={activeForm} />
      )}

    </div>
  );
}

export default Coupons;