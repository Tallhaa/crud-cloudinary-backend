const express = require("express");
const router = new express.Router();
const multer = require("multer");
const users = require("../model/userSchema")
const moment = require("moment")
const cloudinary = require('../helper/cloudinaryconfig');
const path = require('path')






const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
            cb(new Error("File type is not supported"), false);
            return;
        }
        cb(null, true)
    }

})


router.post("/register", upload.single("photo"), async (req, res) => {

    try {
        const { name } = req.body;
        const result = await cloudinary.uploader.upload(req.file.path)

        let user = new users({
            name: name,
            avatar: result.secure_url,
            cloudinary_id: result.public_id

        })


        await user.save()
        console.log(user);
        res.json(result)

    } catch (error) {
        res.status(400).json(error)
    }




})


router.get("/", async (req, res) => {
    try {
        const getUser = await users.find();
        res.status(200).json(getUser)

    } catch (error) {
        res.status(400).json(error)
    }

})

router.get("/:id", async (req, res) => {
    try {
        console.log(req.params.id);

        const getUser = await users.findById(req.params.id);
        res.status(200).json(getUser)
        console.log("testing ", getUser);

    } catch (error) {
        res.status(400).json(error)
    }

})

router.delete("/:id", async (req, res) => {
    try {

        let user = await users.findById(req.params.id);

        await cloudinary.uploader.destroy(user.cloudinary_id);
        await user.deleteOne();
        res.json(user)
        console.log(user);


    } catch (error) {
        res.status(400).json(error)

    }
})

router.put("/:id", upload.single("photo"), async (req, res) => {
    try {
        let user = await users.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.file) {
            // Remove the old image from Cloudinary
            await cloudinary.uploader.destroy(user.cloudinary_id);

            // Upload the new image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path);

            // Update user data
            user = await users.findByIdAndUpdate(req.params.id, {
                name: req.body.name || user.name,
                avatar: result.secure_url,
                cloudinary_id: result.public_id
            }, { new: true });
        } else {
            // Update user data without changing the image
            user = await users.findByIdAndUpdate(req.params.id, {
                name: req.body.name || user.name
            }, { new: true });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: "Error updating user", error });
    }
})


module.exports = router;
