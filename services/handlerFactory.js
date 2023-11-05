const asyncHandler = require('express-async-handler')
const ApiError = require("../utils/apiError");
const ApiFeature = require("../utils/apiFeature");

exports.deleteOne = (model) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        const document = await model.findByIdAndDelete(id);

        if (!document) {
            return next(new ApiError(`No document for this id ${id}`, 404))
        }

        // Trigger "remove" event when update document
        document.deleteOne()

        res.status(204).send();
    });

exports.updateOne = (model) =>
    asyncHandler(async (req, res, next) => {
        const document = await model.findByIdAndUpdate(
            req.params.id, req.body,
            { new: true }
        );

        if (!document) {
            return next(new ApiError(`No document for this id ${id}`, 404));
        }

        // Trigger "save" event when update document
        document.save();

        res.status(200).json({ data: document });
    });

exports.createOne = (model)=>
    asyncHandler(async (req, res) => {
        const document = await model.create(req.body);
        res.status(201).json({ data: document });
    });

exports.getOne = (model, populateOpt) =>
    asyncHandler(async (req, res, next) => {
        const { id } = req.params;
        // TODO ask mets
        // build query
        let query = model.findById(id);
        if (populateOpt) {
            query = query.populate(populateOpt);
        }

        // execute query
        const document = await query;

        if (!document) {
            return next(new ApiError(`No document for this id ${id}`, 404));
        }
        res.status(200).json({ data: document });
    });

exports.getAll = (model, modelName= ' ')=>
    asyncHandler(async (req, res) => {

        let filter = {};
        if (req.filterObj) {
            filter = req.filterObj
        }

        // build query
        const documentCounts = await model.countDocuments()
        const apiFeature = new ApiFeature(model.find(filter), req.query)
            .limitFields()
            .search(modelName)
            .paginate(documentCounts)
            .sort()
            .filter()

        // execute query
        const { mongooseQuery, paginationResult } = apiFeature;
        const document = await mongooseQuery;

        res.status(200).json({ results: document.length, paginationResult, data: document });
    });