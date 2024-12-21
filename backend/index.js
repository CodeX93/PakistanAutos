import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import ManufacturerRouter from "./Controller/Manufacturer.js";
import BikeModelRouter from "./Controller/BikeModel.js";
import BikeSellerRouter from "./Controller/BikeSeller.js";
import BikeInventoryRouter from "./Controller/BikeInventory.js";
import AgentRouter from "./Controller/Agent.js";
import BikeSaleInventoryRouter from "./Controller/BikeSaleInventory.js";
import SparePartRouter from "./Controller/SparePart.js";
import SparePartSellerRouter from "./Controller/SparePartSeller.js";
import SaleSparePartRouter from "./Controller/SaleSparePartInventory.js";
import LedgerRouter from "./Controller/Ledger.js";
import WarrantyClaimRouter from "./Controller/WarrantyClaim.js";
import UserRouter from "./Controller/UserManage.js";
import SparePartCreditBuysRouter from "./Controller/SparePartCreditBuy.js";
import BikeCreditBuyRouter from "./Controller/BikeCreditBuy.js";
import ExpenseRouter from "./Controller/ExpenseController.js";
import LocalCreditBuyRouter from "./Controller/LocalCreditBuy.js"
import CategoryRouter from "./Controller/SparePartCategory.js"
import SubCategoryRouter from "./Controller/SparePartSubCategory.js";
import BikeCreditPurchaseRouter from "./Controller/BikePurchaseCreditBuy.js"
import SparepartCreditPurchaseRouter from './Controller/SparePartPurchaseCreditBuy.js'



dotenv.config();




const app = express();
const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your React app's URL
    methods: ['GET', 'POST','PUT','DELETE','PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'User-Role'],
    exposedHeaders: ['Authorization', 'User-Role'], // Make sure these are exposed
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));



const port = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });


app.get('/', (req, res) => res.send('Hello, World!'));
app.use('/user',UserRouter);
app.use('/manufacturer',ManufacturerRouter);
app.use('/bikemodel',BikeModelRouter);
app.use('/bikeseller',BikeSellerRouter);
app.use('/bikeinventory',BikeInventoryRouter);
app.use('/sparepart',SparePartRouter);
app.use('/agent',AgentRouter);
app.use('/SparePartSeller',SparePartSellerRouter);
app.use('/bikeSaleinventory',BikeSaleInventoryRouter);
app.use('/SparePartSaleinventory',SaleSparePartRouter);
app.use('/ledger',LedgerRouter);
app.use('/warranty',WarrantyClaimRouter);
app.use('/SparePartCreditBuy',SparePartCreditBuysRouter);
app.use('/BikeCreditBuy',BikeCreditBuyRouter);
app.use('/expense', ExpenseRouter)
app.use('/localCreditBuy', LocalCreditBuyRouter)
app.use('/category', CategoryRouter);
app.use('/subcategory', SubCategoryRouter);
app.use('/bikePurchaseCredit', BikeCreditPurchaseRouter);
app.use('/sparepartCredit', SparepartCreditPurchaseRouter);


// app.use("/api/user",upload.single('CandidateProfileImageURL'), UserRoute);
// app.use('/api/trainers', upload.single('TrainerProfileImageURL'), TrainerRouter); // Ensure profileImage is handled
// app.use('/api/courses', upload.single('CourseImage'), CourseRouter);
// app.use('/api/admin', AdminRouter);



app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
