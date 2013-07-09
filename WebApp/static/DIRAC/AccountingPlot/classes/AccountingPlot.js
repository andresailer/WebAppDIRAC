/*!
 * Ext JS Library 4.0
 * Copyright(c) 2006-2011 Sencha Inc.
 * licensing@sencha.com
 * http://www.sencha.com/license
 */

Ext.define('DIRAC.AccountingPlot.classes.AccountingPlot', {
    extend : 'Ext.dirac.core.Module',
    requires : [ 'Ext.util.*', 'Ext.panel.Panel', "Ext.form.field.Text", "Ext.button.Button", "Ext.menu.Menu", "Ext.form.field.ComboBox", "Ext.layout.*", "Ext.form.field.Date",
	    "Ext.form.field.TextArea", "Ext.form.field.Checkbox", "Ext.form.FieldSet", "Ext.Button", "Ext.dirac.utils.DiracMultiSelect", "Ext.util.*", "Ext.toolbar.Toolbar", "Ext.data.Record" ],

    loadState : function(oData) {

	var me = this;

	me.__loadSelectionData(oData.plotParams);

    },

    /*
     * PARTLY DONE
     */
    getStateData : function() {

	var me = this;
	var oReturn = {};

	oReturn.plotParams = me.plotParams;

	return oReturn;

    },

    initComponent : function() {
	var me = this;

	me.launcher.title = "Accounting Plot";
	me.launcher.maximized = false;

	var oDimensions = GLOBAL.APP.desktop.getDesktopDimensions();

	me.launcher.width = 370;
	me.launcher.height = oDimensions[1] - 50;

	me.launcher.x = 0;
	me.launcher.y = 0;

	Ext.apply(me, {
	    layout : 'border',
	    bodyBorder : false,
	    defaults : {
		collapsible : true,
		split : true
	    }
	});

	me.callParent(arguments);

    },

    buildUI : function() {

	var me = this;

	/*
	 * -----------------------------------------------------------------------------------------------------------
	 * DEFINITION OF THE LEFT PANEL
	 * -----------------------------------------------------------------------------------------------------------
	 */

	me.leftPanel = new Ext.create('Ext.panel.Panel', {
	    region : "west",
	    floatable : false,
	    header : false,
	    margins : '0',
	    width : 350,
	    minWidth : 330,
	    maxWidth : 450,
	    bodyPadding : 5,
	    layout : 'anchor',
	    autoScroll : true
	});

	me.rightPanel = new Ext.create('Ext.panel.Panel', {
	    region : "center",
	    floatable : false,
	    header : false,
	    margins : '0',
	    bodyPadding : 0,
	    layout : "border"
	});

	me.descPlotType = {
	    DataOperation : {
		title : "Data Operation",
		selectionConditions : [ [ "OperationType", "Operation Type" ], [ "User", "User" ], [ "ExecutionSite", "Execution Site" ], [ "Source", "Source Site" ],
			[ "Destination", "Destination Site" ], [ "Protocol", "Protocol" ], [ "FinalStatus", "Final Transfer Status" ] ]

	    },
	    Job : {
		title : "Job",
		selectionConditions : [ [ "JobGroup", "Job Group" ], [ "JobType", "Job Type" ], [ "JobClass", "Job Class" ], [ "Site", "Site" ], [ "ProcessingType", "Processing Type" ],
			[ "FinalMajorStatus", "Final Major Status" ], [ "FinalMinorStatus", "Final Minor Status" ], [ "User", "User" ], [ "UserGroup", "User Group" ] ]

	    },
	    WMSHistory : {
		title : "WMS History",
		selectionConditions : [ [ "User", "User" ], [ "UserGroup", "User Group" ], [ "Status", "Major Status" ], [ "MinorStatus", "Minor Status" ],
			[ "ApplicationStatus", "Application Status" ], [ "Site", "Site" ], [ "JobGroup", "Job Group" ], [ "JobSplitType", "Job Split Type" ] ]

	    },
	    Pilot : {
		title : "Pilot",
		selectionConditions : [ [ "User", "User" ], [ "UserGroup", "User Group" ], [ "Site", "Site" ], [ "GridCE", "Grid CE" ], [ "GridMiddleware", "Grid Middleware" ],
			[ "GridResourceBroker", "Grid Resource Broker" ], [ "GridStatus", "Grid Status" ] ]

	    },
	    SRMSpaceTokenDeployment : {
		title : "SRM Space Token Deployment",
		selectionConditions : [ [ "Site", "Site" ], [ "Hostname", "Hostname" ], [ "SpaceTokenDesc", "Space Token Description" ], ]

	    }

	};

	me.cmbDomain = Ext.create('Ext.form.field.ComboBox', {
	    fieldLabel : "Category",
	    queryMode : 'local',
	    labelAlign : 'top',
	    displayField : "text",
	    valueField : "value",
	    anchor : '100%',
	    store : new Ext.data.SimpleStore({
		fields : [ 'value', 'text' ],
		data : [ [ "DataOperation", "Data Operation" ], [ "Job", "Job" ], [ "WMSHistory", "WMS History" ], [ "Pilot", "Pilot" ], [ "SRMSpaceTokenDeployment", "SRM Space Token Deployment" ] ]
	    }),
	    listeners : {
		change : function(field, newValue, oldValue, eOpts) {

		    if (newValue == null)
			return;
		    
		    me.leftPanel.body.mask("Wait ...");
		    Ext.Ajax.request({
			url : GLOBAL.BASE_URL + 'AccountingPlot/getSelectionData',
			method : 'POST',
			params : {
			    type : newValue
			},
			scope : me,
			success : function(response) {

			    var oResult = Ext.JSON.decode(response.responseText);
			    
			    if (oResult["success"] == "true")
				me.applyDataToSelection(oResult, newValue);
			    else
				alert(oResult["error"]);
			    me.leftPanel.body.unmask();
			}
		    });

		}
	    }
	});

	me.cmbPlotGenerate = Ext.create('Ext.form.field.ComboBox', {
	    fieldLabel : "Plot To Generate",
	    queryMode : 'local',
	    labelAlign : 'top',
	    displayField : "text",
	    valueField : "value",
	    anchor : '100%'
	});

	me.cmbGroupBy = Ext.create('Ext.form.field.ComboBox', {
	    fieldLabel : "Group By",
	    queryMode : 'local',
	    labelAlign : 'top',
	    displayField : "text",
	    valueField : "value",
	    anchor : '100%'
	});

	me.fsetTimeSpan = Ext.create('Ext.form.FieldSet', {
	    title : 'Time Span',
	    collapsible : true,
	    layout : 'anchor'
	});

	me.cmbTimeSpan = Ext.create('Ext.form.field.ComboBox', {
	    queryMode : 'local',
	    displayField : "text",
	    valueField : "value",
	    anchor : '100%',
	    value : 86400,
	    store : new Ext.data.SimpleStore({
		fields : [ 'value', 'text' ],
		data : [ [ 86400, "Last Day" ], [ 604800, "Last Week" ], [ 2592000, "Last Month" ], [ -1, "Manual Selection" ], [ -2, "By Quarter" ] ]
	    }),
	    listeners : {
		change : function(field, newValue, oldValue, eOpts) {

		    me.calendarFrom.hide();
		    me.calendarTo.hide();
		    me.cmbQuarter.hide();

		    switch (newValue) {

		    case -1:
			me.calendarFrom.show();
			me.calendarTo.show();
			break;
		    case -2:
			me.__fillComboQuarter();
			me.cmbQuarter.show();
			break;

		    }

		}
	    }

	});

	me.calendarFrom = new Ext.create('Ext.form.field.Date', {
	    width : 100,
	    format : 'Y-m-d',
	    fieldLabel : "Initial Date",
	    labelAlign : 'top',
	    hidden : true
	});

	me.calendarTo = new Ext.create('Ext.form.field.Date', {

	    width : 100,
	    format : 'Y-m-d',
	    fieldLabel : "End Date",
	    labelAlign : 'top',
	    hidden : true

	});

	me.cmbQuarter = Ext.create('Ext.dirac.utils.DiracBoxSelect', {
	    fieldLabel : "",
	    displayField : "text",
	    valueField : "value",
	    anchor : '100%',
	    hidden : true
	});

	me.fsetTimeSpan.add([ me.cmbTimeSpan, me.calendarFrom, me.calendarTo, me.cmbQuarter ]);

	me.fsetSpecialConditions = Ext.create('Ext.form.FieldSet', {
	    title : 'Selection Conditions',
	    collapsible : true,
	    layout : 'anchor'
	});

	me.fsetAdvanced = Ext.create('Ext.form.FieldSet', {
	    title : 'Advanced Options',
	    collapsible : true,
	    layout : 'anchor'
	});

	me.advancedPlotTitle = Ext.create('Ext.form.field.Text', {

	    fieldLabel : "Pilot Title",
	    labelAlign : 'top',
	    anchor : "100%"
	});

	me.advancedPin = Ext.create('Ext.form.field.Checkbox', {
	    boxLabel : 'Pin Dates'
	});

	me.advancedNotScaleUnits = Ext.create('Ext.form.field.Checkbox', {
	    boxLabel : 'Do not scale units'
	});

	me.fsetAdvanced.add([ me.advancedPlotTitle, me.advancedPin, me.advancedNotScaleUnits ]);

	me.leftPanel.add([ me.cmbDomain, me.cmbPlotGenerate, me.cmbGroupBy, me.fsetTimeSpan, me.fsetSpecialConditions, me.fsetAdvanced ]);

	me.btnPlot = new Ext.Button({

	    text : 'New',
	    margin : 3,
	    iconCls : "accp-submit-icon",
	    handler : function() {

		var oSetupData = {};
		
		oSetupData.x = me.getContainer().x+10;
		oSetupData.y = me.getContainer().y+10;
		oSetupData.width = me.getContainer().getWidth();
		oSetupData.height = me.getContainer().getHeight();
		oSetupData.currentState = "";

		
		oSetupData.desktopStickMode = 0;
		oSetupData.hiddenHeader = 1;
		oSetupData.i_x = 0;
		oSetupData.i_y = 0;
		oSetupData.ic_x = 0;
		oSetupData.ic_y = 0;
		
		oSetupData.data = {plotParams: me.__getSelectionParametars()};
		
		GLOBAL.APP.desktop.createWindow("app", "DIRAC.AccountingPlot.classes.AccountingPlot", oSetupData);

	    },
	    scope : me

	});

	me.btnReset = new Ext.Button({

	    text : 'Reset',
	    margin : 3,
	    iconCls : "accp-reset-icon",
	    handler : function() {
		me.__resetSelectionWindow();
	    },
	    scope : me

	});

	me.btnRefresh = new Ext.Button({

	    text : 'Refresh',
	    margin : 3,
	    iconCls : "accp-refresh-icon",
	    handler : function() {

		me.leftPanel.body.mask("Wait ...");
		Ext.Ajax.request({
		    url : GLOBAL.BASE_URL + 'AccountingPlot/getSelectionData',
		    method : 'POST',
		    params : {
			type : me.cmbDomain.getValue()
		    },
		    scope : me,
		    success : function(response) {

			var oResult = Ext.JSON.decode(response.responseText);

			if (oResult["success"] == "true")
			    me.applySpecialConditions(oResult);
			else
			    alert(oResult["error"]);
			me.leftPanel.body.unmask();
		    }
		});

	    },
	    scope : me

	});

	/*
	 * This button is used to refresh any previously selected plot that is
	 * already generated.
	 */
	me.btnRefreshPlot = new Ext.Button({

	    text : 'Update',
	    margin : 3,
	    iconCls : "accp-refresh-icon",
	    handler : function() {
		me.__generatePlot();
	    },
	    scope : me

	});

	var oPanelButtons = new Ext.create('Ext.toolbar.Toolbar', {
	    items : [ me.btnRefreshPlot, me.btnPlot, me.btnReset, me.btnRefresh ],
	    dock : 'bottom',
	    layout : {
		pack : 'center'
	    }
	});

	me.leftPanel.addDocked(oPanelButtons);

	/*
	 * -----------------------------------------------------------------------------------------------------------
	 * DEFINITION OF THE MAIN CONTAINER
	 * -----------------------------------------------------------------------------------------------------------
	 */
	me.plotParams = {};
	me.add([ me.leftPanel, me.rightPanel ]);
	me.plotImage = null;
	me.rightPanel.onResize = function(width, height, oldWidth, oldHeight) {

	    me.__oprResizeImageAccordingToContainer();

	};
	
	me.btnStretchPlot = new Ext.Button({

	    text : 'Stretch Plot',
	    handler : function() {
		
		me.__stretchPlotMode = !me.__stretchPlotMode;
		me.__oprResizeImageAccordingToContainer();
		if(me.__stretchPlotMode){
		    
		    me.btnStretchPlot.setText("Proportional Plot");
		    
		}else{
		    
		    me.btnStretchPlot.setText("Stretch Plot");
		    
		}
	    },
	    scope : me

	});

	me.refreshMenu = new Ext.menu.Menu({
	    items : [ {
		text : 'Disabled',
		value : 0
	    }, {
		text : 'Each 15m',
		value : 900000
	    }, {
		text : 'Each hour',
		value : 3600000
	    }, {
		text : 'Each day',
		value : 86400000
	    } ],
	    listeners : {
		click : function(menu, menuItem, e, eOpts) {

		    if (menuItem.value == 0) {
			clearInterval(me.rightPanel.refreshTimeout);
		    } else {
			clearInterval(me.rightPanel.refreshTimeout);
			me.rightPanel.refreshTimeout = setInterval(function() {

			    Ext.Ajax.request({
				url : GLOBAL.BASE_URL + 'AccountingPlot/generatePlot',
				params : me.plotParams,
				success : function(responseImg) {

				    responseImg = Ext.JSON.decode(responseImg.responseText);

				    if (responseImg["success"]) {

					me.plotImage.setSrc(GLOBAL.BASE_URL + "AccountingPlot/getPlotImg?file=" + responseImg["data"] + "&nocache=" + (new Date()).getTime());
					me.rightPanel.setLoading('Loading Image ...');

				    }
				}
			    });

			}, menuItem.value);
		    }

		    menuItem.parentMenu.up('button').setText("Auto refresh : " + menuItem.text);
		}
	    }
	});
	
	me.__additionalDataLoad = null;
	me.__stretchPlotMode = false;
	

    },

    /*
     * OK
     */
    __fillComboQuarter : function() {

	var me = this;

	var oStore = me.cmbQuarter.getStore();
	oStore.removeAll();

	var now = new Date();

	var currentQ = Math.floor(now.getUTCMonth() / 3) + 1;
	var currentYear = now.getUTCFullYear();

	var oRecords = [];

	do {
	    var recLabel = "" + currentYear + " Q" + currentQ;
	    var recValue = currentYear * 10 + currentQ;

	    oRecords.push([ recValue, recLabel ]);

	    currentQ = currentQ - 1;

	    if (currentQ == 0) {
		currentQ = 4;
		currentYear = currentYear - 1;
	    }

	} while (oRecords.length < 8);

	var oNewStore = new Ext.data.SimpleStore({
	    fields : [ 'value', 'text' ],
	    data : oRecords
	});

	me.cmbQuarter.bindStore(oNewStore);

    },

    /*
     * OK
     */
    __resetSelectionWindow : function() {

	var me = this;

	me.cmbGroupBy.setValue(null);
	me.cmbPlotGenerate.setValue(null);
	me.calendarFrom.setValue(null);
	me.calendarTo.setValue(null);
	me.cmbTimeSpan.setValue(86400);

	me.advancedPin.setValue(false);
	me.advancedNotScaleUnits.setValue(false);
	me.advancedPlotTitle.setValue("");
	me.fsetSpecialConditions.removeAll();
	me.cmbDomain.setValue(null);

    },

    applyDataToSelection : function(oData, sValue) {

	var me = this;

	var oList = oData["result"]["plotsList"];

	me.__oprDoubleElementItemList(oList);

	var oStore = new Ext.data.SimpleStore({
	    fields : [ 'value', 'text' ],
	    data : oList
	});

	me.cmbPlotGenerate.setValue(null);

	me.cmbPlotGenerate.bindStore(oStore);

	var oSelectionData = oData["result"]["selectionValues"];

	var oSelectionOptions = me.descPlotType[sValue]["selectionConditions"];

	me.fsetSpecialConditions.removeAll();

	var oListForGroup = [];

	for ( var i = 0; i < oSelectionOptions.length; i++) {

	    oListForGroup.push([ oSelectionOptions[i][0], oSelectionOptions[i][0] ]);

	    if ((oSelectionOptions[i][0] == "User") || (oSelectionOptions[i][0] == "UserGroup")) {

		// to-do

	    } else {

		var oList = oSelectionData[oSelectionOptions[i][0]];
		
		me.__oprDoubleElementItemList(oList);

		var oMultiList = Ext.create('Ext.dirac.utils.DiracBoxSelect', {
		    fieldLabel : oSelectionOptions[i][1],
		    displayField : "text",
		    valueField : "value",
		    anchor : '100%',
		    store : new Ext.data.SimpleStore({
			fields : [ 'value', 'text' ],
			data : oList
		    }),
		    labelAlign : 'top',
		    name : oSelectionOptions[i][0]
		});

		me.fsetSpecialConditions.add(oMultiList);

	    }

	}

	var oStore = new Ext.data.SimpleStore({
	    fields : [ 'value', 'text' ],
	    data : oListForGroup
	});

	me.cmbGroupBy.setValue(null);

	me.cmbGroupBy.bindStore(oStore);

	// we call the additional function
	if (me.__additionalDataLoad != null) {
	    me.__additionalDataLoad();
	    me.__additionalDataLoad = null;
	}

    },

    /*
     * OK
     */
    applySpecialConditions : function(oData) {

	var me = this;

	var oSelectionData = oData["result"]["selectionValues"];

	for ( var i = 0; i < me.fsetSpecialConditions.items.length; i++) {

	    var oBox = me.fsetSpecialConditions.items.getAt(i);

	    var oList = oSelectionData[oBox.getName()];
	    me.__oprDoubleElementItemList(oList);
	    var oNewStore = new Ext.data.SimpleStore({
		fields : [ 'value', 'text' ],
		data : oList
	    });

	    oBox.refreshStore(oNewStore);

	}

    },
    /*
     * OK
     */
    __oprDoubleElementItemList : function(oList) {

	for ( var i = 0; i < oList.length; i++)
	    oList[i] = [ oList[i], oList[i] ];

    },

    /*
     * OK
     */
    __validateConditions : function() {

	var me = this;
	var bValid = true;

	// check if the plot type is chosen
	if ((me.cmbDomain.getValue() == null) || (Ext.util.Format.trim(me.cmbDomain.getValue()) == "")) {

	    alert("No category defined !");
	    bValid = false;

	} else if ((me.cmbPlotGenerate.getValue() == null) || (Ext.util.Format.trim(me.cmbPlotGenerate.getValue()) == "")) {

	    alert("No plot type defined !");
	    bValid = false;

	} else if ((me.cmbGroupBy.getValue() == null) || (Ext.util.Format.trim(me.cmbGroupBy.getValue()) == "")) {

	    alert("No data grouping defined !");
	    bValid = false;

	}

	// checking the time span selection

	switch (me.cmbTimeSpan.getValue()) {

	case -1:
	    if ((me.calendarFrom.getValue() == null) || (me.calendarTo.getValue() == null)) {

		alert("No dates selected !");
		bValid = false;

	    }
	    break;
	case -2:
	    if (me.cmbQuarter.getValue().length == 0) {

		alert("No quarters selected !");
		bValid = false;

	    }
	    break;

	}

	return bValid;

    },

    /*
     * OK
     */
    __getSelectionParametars : function() {

	var me = this;

	var sDomain = me.cmbDomain.getValue();

	var oParams = {

	    _grouping : me.cmbGroupBy.getValue(),
	    _plotName : me.cmbPlotGenerate.getValue(),
	    _typeName : sDomain

	};

	var sTitle = me.cmbDomain.getDisplayValue() + " :: " + me.cmbPlotGenerate.getDisplayValue() + " :: GROUP BY : " + me.cmbGroupBy.getDisplayValue();

	// Time Selector

	iTimeSpan = me.cmbTimeSpan.getValue();

	if (iTimeSpan == -1) {

	    oParams._timeSelector = -1;

	    oParams._startTime = me.calendarFrom.getValue();
	    oParams._endTime = me.calendarTo.getValue();

	} else if (iTimeSpan == -2) {

	    oParams._timeSelector = -2;

	    var oSelectedQuarters = me.cmbQuarter.getValue();
	    var oMinQuarter = Ext.Array.min(oSelectedQuarters);
	    var oMaxQuarter = Ext.Array.max(oSelectedQuarters);

	    var oMinDate = null;

	    var oYear = Math.floor(oMinQuarter / 10);
	    var oMonth = ((oMinQuarter % 10) - 1) * 3 + 1;

	    oParams._startTime = oYear.toString() + "-" + ((oMonth < 10) ? "0" : "") + oMonth.toString() + "-01";

	    var oMaxDate = null;

	    var oYear = Math.floor(oMaxQuarter / 10);
	    var oMonth = (oMaxQuarter % 10) * 3;
	    var oDay = ((oMonth == 6) ? 30 : 31);

	    oParams._endTime = oYear.toString() + "-" + ((oMonth < 10) ? "0" : "") + oMonth.toString() + "-" + oDay.toString();

	    var oRawSelection = me.cmbQuarter.getRawValue().split(",");
	    var oQuarters = [];

	    for ( var i = 0; i < oRawSelection.length; i++)
		oQuarters.push(Ext.util.Format.trim(oRawSelection[i]));

	    oParams._quarters = oQuarters;

	} else {

	    oParams._timeSelector = iTimeSpan;

	}

	// Special condition selection
	for ( var i = 0; i < me.fsetSpecialConditions.items.length; i++) {

	    var oCondItem = me.fsetSpecialConditions.items.getAt(i);
	    if (oCondItem.getValue().length != 0)
		oParams["_" + oCondItem.getName()] = ((oCondItem.isInverseSelection()) ? oCondItem.getInverseSelection() : oCondItem.getValue().join(","));

	}

	if (Ext.util.Format.trim(me.advancedPlotTitle.getValue()) != "") {
	    oParams["_plotTitle"] = me.advancedPlotTitle.getValue();
	    sTitle = me.advancedPlotTitle.getValue();
	}

	if (me.advancedPin.checked) {

	    oParams["_pinDates"] = "true";

	}

	if (me.advancedNotScaleUnits.checked) {

	    oParams["_ex_staticUnits"] = "true";

	}

	return oParams;

    },
    /*
     * OK
     */
    __oprResizeImageAccordingToContainer : function() {

	var me = this;

	if (me.plotImage == null)
	    return;
	
	var a1 = me.rightPanel.getWidth() - 30;
	var b1 = me.rightPanel.getHeight() - 70;
	
	if(me.__stretchPlotMode){
	    
	    me.plotImage.setWidth(a1);
	    me.plotImage.setHeight(b1);
	    
	    return;
	}

	var a = me.plotImage.originalWidth;
	var b = me.plotImage.originalHeight;

	
	if (a1 < 0)
	    a1 = 0;
	if (b1 < 0)
	    b1 = 0;

	if (b <= b1) {

	    if (a <= a1) {

		if ((a1 / a) <= (b1 / b)) {

		    me.plotImage.setWidth(a1);
		    me.plotImage.setHeight(parseInt(a1 / a * b));

		} else {

		    me.plotImage.setHeight(b1);
		    me.plotImage.setWidth(parseInt(b1 / b * a));

		}

	    } else {

		me.plotImage.setWidth(a1);
		me.plotImage.setHeight(parseInt(a1 / a * b));

	    }

	} else {

	    if (a <= a1) {

		me.plotImage.setHeight(b1);
		me.plotImage.setWidth(parseInt(b1 / b * a));

	    } else {

		if ((a1 / a) <= (b1 / b)) {

		    me.plotImage.setWidth(a1);
		    me.plotImage.setHeight(parseInt(a1 / a * b));

		} else {

		    me.plotImage.setHeight(b1);
		    me.plotImage.setWidth(parseInt(b1 / b * a));

		}

	    }

	}

    },

    __generatePlot : function() {

	var me = this;

	if (!me.__validateConditions())
	    return;

	me.plotParams = me.__getSelectionParametars();

	Ext.Ajax.request({
	    url : GLOBAL.BASE_URL + 'AccountingPlot/generatePlot',
	    params : me.plotParams,
	    scope : me,
	    success : function(response) {

		var me = this;
		var response = Ext.JSON.decode(response.responseText);

		if (response["success"]) {

		    /*
		     * This should go into the container, where we have to load
		     * the image
		     */
		    me.leftPanel.collapse();
		    me.plotImage = Ext.create('Ext.Img', {
			region : "center",
			src : GLOBAL.BASE_URL + "AccountingPlot/getPlotImg?file=" + response["data"] + "&nocache=" + (new Date()).getTime(),
			listeners : {

			    render : function(oElem, eOpts) {
				oElem.el.on({
				    load : function(evt, ele, opts) {

					oElem.originalWidth = oElem.getWidth();
					oElem.originalHeight = oElem.getHeight();

					me.__oprResizeImageAccordingToContainer();

					me.rightPanel.setLoading(false);

				    }
				});

			    }

			}

		    });

		    var oPlotPanel = Ext.create('Ext.panel.Panel', {
			region : "center",
			layout : "absolute",
			items : [ me.plotImage ]

		    });

		    var oHrefParams = "";

		    for ( var oParam in me.plotParams) {

			oHrefParams += ((oHrefParams == "") ? "" : "&") + oParam + "=" + encodeURIComponent(me.plotParams[oParam]);

		    }

		    me.plotToolbar = new Ext.toolbar.Toolbar({
			region : "north",
			items : [ {
			    xtype : "button",
			    text : "Refresh",
			    handler : function() {

				var oThisButton = this;

				Ext.Ajax.request({
				    url : GLOBAL.BASE_URL + 'AccountingPlot/generatePlot',
				    params : me.plotParams,
				    success : function(responseImg) {

					responseImg = Ext.JSON.decode(responseImg.responseText);

					if (responseImg["success"]) {

					    me.plotImage.setSrc(GLOBAL.BASE_URL + "AccountingPlot/getPlotImg?file=" + responseImg["data"] + "&nocache=" + (new Date()).getTime());
					    me.rightPanel.setLoading('Loading Image ...');

					}
				    }
				});

			    }
			}, {
			    xtype : "button",
			    menu : me.refreshMenu,
			    text : "Auto refresh :  Disabled"
			},me.btnStretchPlot, '->', "<a target='_blank' href='" + GLOBAL.BASE_URL + "AccountingPlot/getCsvPlotData?" + oHrefParams + "'>CSV data</a>" ]
		    });

		    me.rightPanel.removeAll();

		    me.rightPanel.add([ me.plotToolbar, oPlotPanel ]);
		    me.rightPanel.setLoading('Loading Image ...');

		} else {
		    alert(response["errors"]);
		}

	    },
	    failure : function(response) {

		Ext.example.msg("Notification", 'Operation failed due to a network error.<br/> Please try again later !');
	    }
	});

    },

    __loadSelectionData : function(oParams) {

	var me = this;

	me.plotParams = oParams;

	if (!("_typeName" in oParams))
	    return;

	me.__additionalDataLoad = function() {
	    
	    me.cmbGroupBy.setValue(oParams["_grouping"]);
	    me.cmbPlotGenerate.setValue(oParams["_plotName"]);
	    me.cmbTimeSpan.setValue(oParams["_timeSelector"]);

	    me.calendarFrom.hide();
	    me.calendarTo.hide();
	    me.cmbQuarter.hide();

	    switch (oParams["_timeSelector"]) {

	    case -1:
		me.calendarFrom.setValue(oParams["_startTime"]);
		me.calendarTo.setValue(oParams["_endTime"]);
		me.calendarFrom.show();
		me.calendarTo.show();
		break;

	    case -2:
		var oNewQuartersArray = [];

		for ( var i = 0; i < oParams["_quarters"].length; i++)
		    oNewQuartersArray.push(parseInt(oParams["_quarters"][i].replace(" Q", "")));

		me.cmbQuarter.setValue(oNewQuartersArray);
		me.cmbQuarter.show();
		break;

	    }

	    me.advancedPlotTitle.setValue(oParams["_plotTitle"]);

	    if ("_pinDates" in oParams) {

		if (oParams["_pinDates"] == "true")
		    me.advancedPin.setValue(true);
		else
		    me.advancedPin.setValue(false);

	    } else
		me.advancedPin.setValue(true);

	    if ("_ex_staticUnits" in oParams) {

		if (oParams["_ex_staticUnits"] == "true")
		    me.advancedNotScaleUnits.setValue(true);
		else
		    me.advancedNotScaleUnits.setValue(false);

	    } else
		me.advancedNotScaleUnits.setValue(false);

	    for ( var i = 0; i < me.fsetSpecialConditions.items.length; i++) {

		me.fsetSpecialConditions.items.getAt(i).setValue(null);

	    }

	    var oStandardParamsList = [ "_grouping", "_plotName", "_typeName", "_timeSelector", "_startTime", "_endTime", "_plotTitle", "_pinDates", "_ex_staticUnits" ];

	    for ( var oParam in oParams) {

		// first we check whether the param is not someone form the
		// default ones
		var oFound = false;

		for ( var i = 0; i < oStandardParamsList.length; i++) {

		    if (oParam == oStandardParamsList[i]) {

			oFound = true;
			break;

		    }

		}

		if (!oFound) {

		    for ( var i = 0; i < me.fsetSpecialConditions.items.length; i++) {

			var oNewUnderlinedName = "_" + me.fsetSpecialConditions.items.getAt(i).getName();
			
			if (oNewUnderlinedName == oParam) {
			   
			    me.fsetSpecialConditions.items.getAt(i).setValue(oParams[oParam].split(","));
			    break;

			}

		    }

		}

	    }

	    me.__generatePlot();

	};
	
	
	
	if (me.cmbDomain.getValue() == oParams["_typeName"]) {

	    me.__additionalDataLoad();
	    me.__additionalDataLoad = null;
	}

	me.cmbDomain.setValue(oParams["_typeName"]);

    }

});
