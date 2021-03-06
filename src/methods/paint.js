
export default async function ($element, layout, self, qlik, $) {

	//////////////////
	// Init
	/////////////////
	const tableId = layout.props.tableId;
	self.$scope.props.defaultItems = layout.props.defaultItems;
	self.$scope.props.title = layout.props.title;


	const state = self.$scope.state;
	const hypercube = layout.qHyperCube;


	await self.$scope.app.getObjectProperties(tableId)
		.then(reply => {
			self.$scope.fullDimensions = reply.properties.qHyperCubeDef.qDimensions.map(dimension => {
				return {
					qLibraryId: dimension.qLibraryId,
					qDef: dimension.qDef,
					qCalcCondition: dimension.qCalcCondition,
					qShowTotal: dimension.qShowTotal,
					qAttributeExpressions: dimension.qAttributeExpressions,
					qShowAll: dimension.qShowAll,
					qOtherTotalSpec: dimension.qOtherTotalSpec,
					qNullSuppression: dimension.qNullSuppression,
					label: dimension.qDef.qFieldLabels[0] ? dimension.qDef.qFieldLabels[0] : dimension.qDef.qFieldDefs[0],
				}
			})


			self.$scope.fullMeasures = reply.properties.qHyperCubeDef.qMeasures.map(measure => {
				return {
					qLibraryId: measure.qLibraryId,
					qDef: measure.qDef,
					qCalcCondition: measure.qCalcCondition,
					qSortBy: measure.qSortBy,
					qAttributeExpressions: measure.qAttributeExpressions,
					label: measure.qLabel ? measure.qDef.qLabel : measure.qDef.qDef
				}
			})
		})


	if(!self.$scope.baseDimensions){
		await self.$scope.createBaseDimensions(self.$scope.fullDimensions);
	}
	if(!self.$scope.baseMeasures){
		await self.$scope.createBaseMeasures(self.$scope.fullMeasures);
	}


	// create menuItems from base table

	self.$scope.menuDimensions = [];
	self.$scope.menuMeasures = [];

	self.$scope.fullDimensions.map(fullDim => {
		return self.$scope.baseDimensions
			.filter(tableDim => fullDim.qDef.cId === tableDim.cId && tableDim.qFallbackTitle)
			.map(tableDim => {
				self.$scope.menuDimensions.push({
					cId: tableDim.cId,
					label: tableDim.qFallbackTitle ? tableDim.qFallbackTitle : null,
					isActive: fullDim.isActive,
					type: "d"
				})
			}
		)
	})

	self.$scope.fullMeasures.map(fullMeasure => {
		return self.$scope.baseMeasures
			.filter(tableMeasure => fullMeasure.qDef.cId === tableMeasure.cId && tableMeasure.qFallbackTitle)
			.map(tableMeasure => {
				self.$scope.menuMeasures.push({
					cId: tableMeasure.cId,
					label: tableMeasure.qFallbackTitle ? tableMeasure.qFallbackTitle : null,
					isActive: fullMeasure.isActive,
					type: "m"
				})
			}
		)
	})


	self.$scope.updateStateItems();
	self.$scope.updateMenuState();


	// render table

	if(!self.$scope.table){
		// console.log("render table")
		// this need to use activeDimensions
		self.$scope.table = await self.$scope.createTable([],[]);
		self.$scope.isLoading = false;
		self.$scope.table.show("cbcr__table")
			.then(reply => {
				self.$scope.applyDefaultState()
			})
	}

	return qlik.Promise.resolve();

	// self.resize();
}
