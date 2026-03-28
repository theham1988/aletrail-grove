import VendorDetailsDrawer from "./VendorDetailsDrawer";

export default function FestivalVendorSheet({ vendor, onClose }) {
  return (
    <VendorDetailsDrawer
      vendor={vendor}
      onClose={onClose}
      description={
        vendor ? `${vendor.activePassports.length} active passport(s). Tap scan to collect eligible stamps.` : ""
      }
    />
  );
}
