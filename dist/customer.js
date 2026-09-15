"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGuest = createGuest;
exports.createMember = createMember;
exports.getCustomerDiscount = getCustomerDiscount;
exports.getCustomerTypeLabel = getCustomerTypeLabel;
function createGuest(id, name, phone, address) {
    return {
        id,
        name,
        phone,
        address,
        customerType: "guest"
    };
}
function createMember(id, name, phone, address, membershipLevel) {
    const discountMap = {
        silver: 5,
        gold: 10,
        platinum: 15
    };
    return {
        id,
        name,
        phone,
        address,
        customerType: "member",
        membershipId: `MEM-${id.toString().padStart(4, "0")}`,
        discountPercentage: discountMap[membershipLevel],
        membershipLevel
    };
}
function getCustomerDiscount(customer) {
    if ("discountPercentage" in customer) {
        return customer.discountPercentage;
    }
    return 0;
}
function getCustomerTypeLabel(customer) {
    if (customer.customerType === "member") {
        return `${customer.membershipLevel.toUpperCase()} Member`;
    }
    return "Guest";
}
