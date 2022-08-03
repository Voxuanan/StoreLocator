const express = require("express");
const router = express.Router();
const storeCtrl = require("../controllers/storeCtrl");
const userMdw = require("../middleware/userMdw");

router.route("/").get(storeCtrl.getStores).post(storeCtrl.addStore);
router.get("/:north/:west/:south/:east/", storeCtrl.queryByCoordinates);
router.post("/review/:storeId", userMdw.isLogin, storeCtrl.reviewStore);

module.exports = router;
