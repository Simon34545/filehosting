var warning = "";
var thisIndex = "";
var testsRun = false;

var failures_severe = false;
var failures_minor = false;

var formFaults = false;
var linkFaults = false;
var imageFaults = false;
var tableFaults = false;
var ariaFaults = false;

var approveAction = "";

//add target click behavour to list
function addListTargetBehaviours()
{
	$("#problemList a").click(function(e){
		$("div").removeClass("AccQPATtargetLink");
		var linkTarget = this.href.split("#")[1];
		$("#" + linkTarget).addClass("AccQPATtargetLink");
	});
}


function issuesFilter()
{
	$("form#filter").html("<div><input type=\"checkbox\" id=\"chk_0_important\" name=\"chk_0_important\" value=\"Important issues\" checked=\"checked\"/> <label for=\"chk_0_important\">Show [high] importance issues</label></div><div><input type=\"checkbox\" id=\"chk_1_medium\" name=\"chk_1_medium\" value=\"Medium issues\" checked=\"checked\"/> <label for=\"chk_1_medium\">Show [med] importance issues</label></div>");
	$("#chk_1_medium").click(function(){
		if (this.checked) {
			$("#problemListUl ul li.QPATseverity_minor").show();
		}
		else {
			$("#problemListUl ul li.QPATseverity_minor").hide();
		}
	});
	$("#chk_0_important").click(function(){
		if (this.checked) {
			$("#problemListUl ul li.QPATseverity_severe").show();
		}
		else {
			$("#problemListUl ul li.QPATseverity_severe").hide();
		}
	});
}

//create problem list
function createProblemList() {
	$("head").append("<link href=\"https://accessify.com/tools-and-wizards/accessibility-tools/favelets/quick-page-test/accessify-page-test.css\" rel=\"stylesheet\" type=\"text/css\" />")
	$("body").append("<div id=\"problemList\"><h1>Problems were found with this page</h1><form id=\"filter\"></form><p>Click on a link to take you to the problem area</p><ul id=\"problemListUl\"></ul><div id=\"email\"><p><a href=\"mailto:qapt-reqs@accessify.com\">Send feature requests to qapt-reqs@accessify.com</a></p></div></div>")
	$("#problemList").hide();
}

//Add item to problem list
function addToProblemList(id, description, severity,containerUl) {
	if (severity=="m") 
	{
		failures_minor = true;
		severity = "QPATseverity_minor";
		var ind = "<b title=\"Suggest that this is fixed/amended but not critical\">[med]</b> ";
	}
	if (severity=="s") 
	{
		failures_severe = true;
		severity = "QPATseverity_severe";
		var ind = "<b title=\"High priority - this need to be fixed\">[high]</b> ";
	}
	var container = id + "_parent";
	$("#" + id).wrap("<div class=\"AccQPATwarningText " + severity + "\" id=\"" + container + "\"></div>");
	$("#" + container).append(" <span class=\"AccQPATwarningText_Inner\">" + description + "</span>");
	
	$("#problemListUl ul#ul_" + containerUl).append("<li class=\"" + severity + "\"><a href='#" + container + "'>" + ind + description + "</a></li>");
}

//function addProblemCategory(cat,catId) {
//	$("#problemListUl").append("<li><h2><a href=\"#\">" + cat + "</a></h2></li>");
//	$("#problemListUl").append("<li id=\"noprobs_" + catId + "\">No problems found</li>");
//}
function addProblemCategory(cat,catId) {
	$("#problemListUl").append("<h2 title=\"Click to expand/collapse these test results\"><a href=\"#\"><span class=\"plusminus\">-</span>" + cat + "</a></h2>");
	$("#problemListUl").append("<ul class=\"pl\" id=\"ul_" + catId +"\"></ul>");
}

// FORM TESTS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function FORMS_showMissingLabels()
{
	var inputType="";
	$("input").each(function(e)
	{
		if (($(this).attr("type")=="text")||($(this).attr("type")=="password")||($(this).attr("type")=="radio")||($(this).attr("type")=="checkbox")) 
		{
			var inputId = $(this).attr("id");
			thisIndex = "MissingLabelsIndex" + $("input").index(this);
			$(this).attr("id",thisIndex);
			if (inputId==null) 
			{
				warning = "Input has no <code>id</code> attribute (hence missing a valid <code>label</code>)";
				addToProblemList(thisIndex,warning,"s","forms");
				formFaults = true;
			}
			else 
			{
				//id found. Check for related label
				var relatedLabelFound = false;
				$("label").each(function(e)
				{
					if ($(this).attr("for") == inputId) 
					{// matching label found
						relatedLabelFound = true;
					}
				})

				if (!relatedLabelFound)
				{
					warning = "Input has an <code>id ('" + inputId + "')</code> but no associated <code>label</code> found";
					addToProblemList(thisIndex,warning,"s","forms");
					formFaults = true;
				}
			}
			$(this).attr("id",inputId);
		}
	})
}

function FORMS_checkLabelTags()
{
	$("label").each(function(e)
	{
		var labelId = $(this).attr("id");
		var thisIndex = "thisLabelIndex" + $("label").index(this);
		var labelFor = $(this).attr("for");
		$(this).attr("id",thisIndex);
		if (labelFor==null)
		{
			warning = "This <code>label</code> is missing a <code>for</code> attribute (<code>label</code> is orphaned)";
			addToProblemList(thisIndex,warning,"m","forms");
			formFaults = true;
		}
		else
		{
			// for attrib found. Check for related input
			var relatedFormInputFound = false;
			$("input,select,textarea").each(function(e)
			{
				if ($(this).attr("id") == labelFor)
				{// matching form input found
					relatedFormInputFound = true;
					//check to see position of input relative to control
//					$(this).wrap("<span></span>");
					$(this).wrap("<div></div>");
					var inputHtmlString = $(this).parent().html();
					var bodyHtmlString = $("body").html();
					var inputPos = bodyHtmlString.indexOf(inputHtmlString);
					var labelPos = bodyHtmlString.indexOf(thisIndex);
					var inputType = $(this).attr("type");
					if ((inputType=="radio")||(inputType=="checkbox"))
					{//label should come after input
						if (inputPos > labelPos) 
						{
							warning = "For input of type '" + inputType + "', the <code>label</code> should ideally come *after* the <code>input</code>";
							addToProblemList(thisIndex,warning,"m","forms");
							formFaults = true;
						}
					}
					else if ((inputType!="hidden")&&(inputType!="submit")&&(inputType!="button"))
					{
						//label should come beforeinput
						if (inputPos < labelPos) 
						{
							warning = "For text <code>input</code>s, <code>select</code> lists and <code>textarea</code>s '" + inputType + "', the <code>label</code> should ideally come *before* the <code>input</code>";
							addToProblemList(thisIndex,warning,"m","forms");
							formFaults = true;
						}
					}
					//can ignore hidden, button, submit
				}
			})
			if (!relatedFormInputFound)
			{
				warning = "This <code>label</code> has a <code>for</code> attribute, but no matching <code>id</code> found";
				addToProblemList(thisIndex,warning,"s","forms");
				formFaults = true;
			}
		}
	})
}


function FORMS_checkFieldsetForLegend()
{
	$("fieldset:not(:has('legend'))").each(function(e)
	{
		thisIndex = "fieldsetIndex" + $("fieldset").index(this);
		$(this).attr("id",thisIndex);
		warning = "<code>fieldset</code> requires a <code>legend</code>";
		addToProblemList(thisIndex,warning,"s","forms");
		formFaults = true;
	})
}

// IMAGE TESTS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function IMAGES_checkAltAttributes()
{
	$("img").each(function(e)
	{
		var alt = $(this).attr("alt");
		thisIndex = "altAttributesIndex" + $("img").index(this);
		$(this).attr("id",thisIndex);
		var img_w = $(this).attr("width");
		var img_h = $(this).attr("height");
		if((alt==undefined)||(alt=="")) 
		{
//			$(this).wrap("<span></span>");
			$(this).wrap("<div></div>");
			var html = $(this).parent().html();
			alt = html.match( /alt=/ );
			if (alt==null)
			{
				alt = "This image is missing an <code>alt</code> attribute";
				addToProblemList(thisIndex,alt,"s","images");
				imageFaults=true;
			}
			else
			{
				alt = "This image has an empty <code>alt</code> attribute (<code>alt=\"\"</code>). Are you <em>sure</em> it doesn't need one?";
				addToProblemList(thisIndex,alt,"m","images");
				imageFaults=true;
			}
		}
		else
		{
			if (alt.length>150)
			{
				alt = "Image has very long <code>alt</code> attribute:<blockquote>" + alt + "</blockquote>[<code>alt</code> has " + alt.length + " characters - advised to keep under 150]";
				addToProblemList(thisIndex,alt,"m","images");
				imageFaults=true;
			}
			else if ((alt.toLowerCase()=="spacer")||(alt.toLowerCase()=="bullet")||(alt.toLowerCase()=="blank")||(alt.toLowerCase()=="nothing")||(alt.toLowerCase()=="click here"))
			{
				alt = "This image has a completely pointless and unhelpful <code>alt</code> attribute (\"<strong>" + alt + "</strong>\"). You should use an empty alt instead [alt=\"\"]";
				addToProblemList(thisIndex,alt,"s","images");
				imageFaults=true;
			}
			else if (alt.toLowerCase() == $(this).attr("title").toLowerCase())
			{
				alt = "This image has identical <code>alt</code> and <code>title</code> attributes (both are \"<strong>" + alt + "</strong>\"). The <code>title</code> attribute is superfluous and should be removed";
				addToProblemList(thisIndex,alt,"m","images");
				imageFaults=true;
			}
			else if ((alt.length>50)&&((img_w * img_h) <= 100))
			{
				alt = "This image is very small (" + (img_w * img_h) + " pixels squared) but appears to have quite a long <code>alt</code> attribute:<blockquote>\"" + alt + "\"</blockquote>Is this really a suitable alternative to this image? Or is it mis-use of the <code>alt</code> attribute?";
				addToProblemList(thisIndex,alt,"m","images");
				imageFaults=true;
			}
			else
			{
			// no problem found
			}
		}
	})
}

function IMAGES_checkForPointlessLongdescs()
{
	$("img[longdesc]").each(function(e)
	{
		thisIndex = "pointlessLongdescIndex" + $("img[longdesc]").index(this);
		$(this).attr("id",thisIndex);
		var msg = "This image has a <code>longdesc</code> attribute (which links to file '" + $(this).attr("longdesc") + "'). <code>longdesc</code> is not supported in any current (decent) browser.";
		addToProblemList(thisIndex,msg,"m","images");
		imageFaults=true;
	})
}

// TABLE TESTS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function TABLES_findSummarys()
{
	$("table").each(function(e)
	{
		var sum = $(this).attr("summary");
		thisIndex = "TableSummaryIndex" + $("table").index(this);
		$(this).attr("id",thisIndex);
		if ((sum=="")||(sum==null)) 
		{
			addToProblemList(thisIndex,"Table is missing a <code>summary</code> attribute or the <code>summary</code> is empty. Data table should contain a suitable summary of the table's contents","m","tables");
			tableFaults=true;
		}
	})
}

function TABLES_scopeOrHeaders()
{
	var scopeOrHeadersMissing = false;
	$("table").each(function(e)
	{
		var tableHtml = $(this).html();
		thisIndex = "TABLES_scopeOrHeadersIndex" + $("table").index(this);
		$(this).attr("id",thisIndex);
		var s = tableHtml.match( /scope=/ );
		var h = tableHtml.match( /headers=/ );
		scopeOrHeadersMissing = ((s==null) && (h==null));
		if (scopeOrHeadersMissing)
		{
			warning = "Data table is missing both <code>scope</code> <em>and</em> <code>headers</code>/<code>id</code> attributes";
			addToProblemList(thisIndex,warning,"s","tables");
			tableFaults=true;
		}
	});
}

function TABLES_captionsSuggestHeadings()
{
	$("table:has('caption')").each(function(){
		thisIndex = "TABLES_captionsSuggestHeadings" + $("table:has('caption')").index(this);
		$(this).attr("id",thisIndex);
		warning = "This table has a <code>caption</code> element. While not a failure, a better option may be to use a heading (<code>h1</code>-<code>h6</code>) before the table instead of a <code>caption</code>";
		addToProblemList(thisIndex,warning,"m","tables");
		tableFaults=true;
	});
}

// LINK TESTS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function LINKS_checkBadLinks()
{
	$("a[href^=javascript:]").each(function(e)
	{
		thisIndex = "badLinksTest1Index" + $("a[href^=javascript:]").index(this);
		$(this).attr("id",thisIndex);
		warning = "This link uses the <code>javascript:</code> pseudo protocol";
		addToProblemList(thisIndex,warning,"s","links");
		linkFaults=true;
	})
	$("a").each(function(e)
	{
		$(this).wrap("<div></div>");
		if ($(this).parent().html().indexOf("window.open(")!=-1)
		{
			thisIndex = "badLinksTest2Index" + $("a").index(this);
			$(this).attr("id",thisIndex);
			warning = "This link has a <code>window.open()</code> method (" + $(this).attr("onclick") + "). Provide a proper <code>href</code> and use external JS to spawn pop-up";
			addToProblemList(thisIndex,warning,"m","links");
			linkFaults=true;
		}
		var thisLinkText = $(this).text().toLowerCase();
		if ((thisLinkText=="click here")||(thisLinkText=="more")||(thisLinkText=="more info")||(thisLinkText=="here")||(thisLinkText=="go"))
		{
			thisIndex = "badLinksTest5Index" + $("a").index(this);
			$(this).attr("id",thisIndex);
			warning = "This link is not helpful at all. When taken out of context of surrounding text it is meaningless. A screen reader user would just hear the link as \"" + $(this).text() + "\"";
			addToProblemList(thisIndex,warning,"s","links");
			linkFaults=true;
		}
	})
	$("a[target]:not(a[title])").each(function(e)
	{
		if (!(($(this).attr("target")=="_self")||($(this).attr("target")=="_parent")))
		{
			thisIndex = "badLinksTest3Index" + $("a").index(this);
			$(this).attr("id",thisIndex);
			warning = "This link has a <code>target</code> attribute (opens in a window named '" + $(this).attr("target") + "') but has no <code>title</code> attribute to warn the user";
			addToProblemList(thisIndex,warning,"m","links");
			linkFaults=true;
		}
	})
	$("a[tabindex]").each(function(e)
	{
		thisIndex = "badLinksTabIndex" + $("a").index(this);
		$(this).attr("id",thisIndex);
		warning = "This link has a <code>tabindex</code> attribute. It's nearly always better to omit <code>tabindex</code> entirely, unless the display is radically different from the document flow. Do you need a <code>tabindex</code>?";
		addToProblemList(thisIndex,warning,"m","links");
		linkFaults=true;
	})
	$("a[name]:not(a[href])").each(function(e)
	{
		thisIndex = "badLinksTest5Index" + $("a").index(this);
		$(this).attr("id",thisIndex);
		warning = "This appears to be an anchor (destination of another link, with the name \"" + $(this).attr("name") + "\") but it has no <code>href</code> attribute. You should also add a matching <code>href</code> (to solve a keyboard navigation bug), e.g. <code>&lt;a name=\"" + $(this).attr("name") + "\" <b>href=\"#" + $(this).attr("name") + "\"</b>&gt;</code> ";
		addToProblemList(thisIndex,warning,"m","links");
		linkFaults=true;
	})
	$("a[title]").each(function(e)
	{
		if ($(this).attr("title").toLowerCase() == $(this).text().toLowerCase())
		{
			thisIndex = "badLinksTest4Index" + $("a").index(this);
			$(this).attr("id",thisIndex);
			warning = "This link has a <code>title</code> attribute which is identical to the link text. The <code>title</code> is superfluous and should be removed";
			addToProblemList(thisIndex,warning,"m","links");
			linkFaults=true;
		}
	})
}

// ARIA TESTS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
function ARIA_findNavigationAreas()
{
	$("ul:has(li:gt(2) a), ol:has(li:gt(2) a)").each(function(){
		thisIndex = "ariaTest1Index" + $("ul:has(li:gt(2) a), ol:has(li:gt(2) a)").index(this);
		$(this).attr("id",thisIndex);
		warning = "This <em>appears</em> to be a series of links. Perhaps this should be marked up with ARIA landmark role 'navigation'";
		addToProblemList(thisIndex,warning,"m","aria");
		ariaFaults=true;
	})
}

function ARIA_findArticles()
{
	$("ul:has(li:gt(2) a), ol:has(li:gt(2) a)").each(function(){
		thisIndex = "ariaTest1Index" + $("ul:has(li:gt(2) a), ol:has(li:gt(2) a)").index(this);
		$(this).attr("id",thisIndex);
		warning = "This <em>appears</em> to be a series of links. Perhaps this should be marked up with ARIA landmark role 'navigation'";
		addToProblemList(thisIndex,warning,"m","aria");
		ariaFaults=true;
	})
}

// Set up the placeholder for error messages
createProblemList();

// Run accessibility tests

function imageTests()
{
	addProblemCategory("Image Tests","images");
	IMAGES_checkAltAttributes();
	IMAGES_checkForPointlessLongdescs();
}

function tableTests()
{
	addProblemCategory("Table Tests","tables");
	TABLES_findSummarys();
	TABLES_scopeOrHeaders();
	TABLES_captionsSuggestHeadings();
}

function formTests()
{
	addProblemCategory("Form Tests","forms");
	FORMS_showMissingLabels();
	FORMS_checkLabelTags();
	FORMS_checkFieldsetForLegend();
}

function linkTests()
{
	addProblemCategory("Link Tests","links");
	LINKS_checkBadLinks();
}

function ariaTests()
{
	addProblemCategory("ARIA Tests","aria");
	ARIA_findNavigationAreas();
}

function removeRedundantNoProbsMessages()
{
	if (formFaults) {$("#noprobs_forms").empty()};
	if (linkFaults) {$("#noprobs_links").empty()};
	if (imageFaults) {$("#noprobs_images").empty()};
	if (tableFaults) {$("#noprobs_tables").empty()};
}

/*
 * ppDrag 0.2 - Extremely Fast Drag&Drop for jQuery
 * http://ppdrag.ppetrov.com/
 *
 * Copyright (c) 2008 Peter Petrov (ppetrov AT ppetrov.com)
 * Licensed under the LGPL (LGPL-LICENSE.txt) license.
 */

(function($) {
	
	$.fn.ppdrag = function(options) {
		if (typeof options == 'string') {
			if (options == 'destroy') return this.each(function() {
				$.ppdrag.removeEvent(this, 'mousedown', $.ppdrag.start, false);
				$.data(this, 'pp-ppdrag', null);
			});
		}
		return this.each(function() {
			$.data(this, 'pp-ppdrag', { options: $.extend({}, options) });
			$.ppdrag.addEvent(this, 'mousedown', $.ppdrag.start, false);
		});
	};
	
	$.ppdrag = {
		start: function(event) {
			if (!$.ppdrag.current) {
				$.ppdrag.current = { 
					el: this,
					oleft: parseInt(this.style.left) || 0,
					otop: parseInt(this.style.top) || 0,
					ox: event.pageX || event.screenX,
					oy: event.pageY || event.screenY
				};
				var current = $.ppdrag.current;
				var data = $.data(current.el, 'pp-ppdrag');
				if (data.options.zIndex) {
					current.zIndex = current.el.style.zIndex;
					current.el.style.zIndex = data.options.zIndex;
				}
				$.ppdrag.addEvent(document, 'mouseup', $.ppdrag.stop, true);
				$.ppdrag.addEvent(document, 'mousemove', $.ppdrag.drag, true);
			}
			if (event.stopPropagation) event.stopPropagation();
			if (event.preventDefault) event.preventDefault();
			return false;
		},
		
		drag: function(event) {
			if (!event) var event = window.event;
			var current = $.ppdrag.current;
			current.el.style.left = (current.oleft + (event.pageX || event.screenX) - current.ox) + 'px';
			current.el.style.top = (current.otop + (event.pageY || event.screenY) - current.oy) + 'px';
			if (event.stopPropagation) event.stopPropagation();
			if (event.preventDefault) event.preventDefault();
			return false;
		},
		
		stop: function(event) {
			var current = $.ppdrag.current;
			var data = $.data(current.el, 'pp-ppdrag');
			$.ppdrag.removeEvent(document, 'mousemove', $.ppdrag.drag, true);
			$.ppdrag.removeEvent(document, 'mouseup', $.ppdrag.stop, true);
			if (data.options.zIndex) {
				current.el.style.zIndex = current.zIndex;
			}
			if (data.options.stop) {
				data.options.stop.apply(current.el, [ current.el ]);
			}
			$.ppdrag.current = null;
			if (event.stopPropagation) event.stopPropagation();
			if (event.preventDefault) event.preventDefault();
			return false;
		},
		
		addEvent: function(obj, type, fn, mode) {
			if (obj.addEventListener)
				obj.addEventListener(type, fn, mode);
			else if (obj.attachEvent) {
				obj["e"+type+fn] = fn;
				obj[type+fn] = function() { return obj["e"+type+fn](window.event); }
				obj.attachEvent("on"+type, obj[type+fn]);
			}
		},
		
		removeEvent: function(obj, type, fn, mode) {
			if (obj.removeEventListener)
				obj.removeEventListener(type, fn, mode);
			else if (obj.detachEvent) {
				obj.detachEvent("on"+type, obj[type+fn]);
				obj[type+fn] = null;
				obj["e"+type+fn] = null;
			}
		}
		
	};

})(jQuery);


//run all groups of tests 
ariaTests();
imageTests();
linkTests();
formTests();
tableTests();
removeRedundantNoProbsMessages();

var alertText = "";

if (failures_minor)
{
	alertText = "There were some problems with this page,\nbut they are not critical.";
}

if (failures_severe) 
{
	alertText = "There are some faults on this page that should be fixed.";
}

if ((failures_severe)||(failures_minor))
{
	$("body").append("<div id='spacer'></div>");
	$("#problemList").show().fadeTo('slow',0.95).ppdrag().css("position","fixed").css("left","500px").css("top","20px");
	issuesFilter();
	$("#problemList h2").click(function(){
		if (($(this).hasClass("expanded"))||($(this).attr("class")==""))
		{
			$(this).removeClass("expanded")
			$(this).addClass("contracted")
		}
		else
		{
			$(this).removeClass("contracted")
			$(this).addClass("expanded")
		}
		updateexpandContract();
		$(this).next().toggle();
		return false;
	});
	function updateexpandContract()
	{
		$("#problemList h2.contracted span.plusminus").html("+");
		$("#problemList h2.expanded span.plusminus").html("-");
	}
	addListTargetBehaviours();
//	alert (alertText + "\n\nThe problems are listed on the panel on the left.\n\nClick on the link for each fault to find it on the page");
}

testsRun = true;
