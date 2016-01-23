"use strict";

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
if (!Array.prototype.forEach) {
  Array.prototype.forEach = function forEach(callback, thisArg) {
    'use strict';
    var T, k;

    if (this == null) {
      throw new TypeError("this is null or not defined");
    }

    var kValue,
        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        O = Object(this),

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        len = O.length >>> 0; // Hack to convert O.length to a UInt32

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if ({}.toString.call(callback) !== "[object Function]") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length >= 2) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {
      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as the this value and
        // argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

var forEach = Array.prototype.forEach;

var VIEW = {
  info: null,
  init: function() {
    VIEW.info = document.getElementById("info");
  }
}

var BUS = {
  version : "20160120",
  enviroment : "", // app: http: file:
  externalProtocol : "http:",
  canvasHeight : 0,
  app : {
    dom : null,
    status : "home-list"
  },
  sections : ["secHome", "secNearbyStop", "secBusStop", "secBusNumber"],
  homeArticles : [
    {
      id : "geoInfo",
      selected : false,
      dom : null,
      button : null,
      buttonCall : "submitArticle"
    },
    {
      id : "busStop",
      selected : false,
      dom : null,
      button : null,
      buttonCall : "showArticle"
    },
    {
      id : "busNumber",
      selected : false,
      dom : null,
      button : null,
      buttonCall : "showArticle"
    },
    {
      id : "frecencyWrapper",
      selected : false,
      dom : null,
      button : null,
      buttonCall : "showArticle"
    }
  ],
  reloadeable : false,
  reloadTimeoutID : 0,
  init : function() {
    BUS.enviroment = window.location.protocol;
    if (document.getElementById("secHome")) { // Section without ajax don't has home section
      BUS.updateHistory("secHome");
    }
    /* Home */
    BUS.app.dom = document.querySelector("body");
    BUS.setStatus("home-list");
    // Click: show detail info and hide other seccions
    BUS.homeArticles.forEach(function(a) {
      var article = document.getElementById(a.id);
      a.dom = article;
      a.button = article.querySelector(".action-home, .action-frecency");
      if(a.button) {
        a.button.addEventListener(
          "click",
          function(event) {
            BUS[a.buttonCall](a.id); // Class to BUS.showArticle(idArticle) | BUS.submitArticle(idArticle)
            event.preventDefault();
          },
          false);
      }
      console.log("**", article, a.button);
    });
    BUS.showArticle();

//    BUS.sections.forEach(function(section) {
//      document.getElementById(section).classList.add("hidden");
//    });
//    var homeButtons = document.querySelectorAll("#secHome #geoInfo, #secHome #busStop, #secHome #busNumber, #secHome #frecencyWrapper");


    /* Back buttom */
    BUS.initGoBack(document);
    /* External link */
    if (BUS.enviroment == "app:") {
      var aExternal = document.querySelectorAll("a[rel=external]");
      for (var n = 0; n < aExternal.length; n++) {
        aExternal[n].setAttribute("target", "_blank");
      }
    }

    /* Stops in line direction */
    var paths = document.querySelectorAll(".stopsLine");
    for (var n = 0; n < paths.length; n++) {
      var dTrigger = paths[n].querySelector("h1");
      var dTarget = paths[n].querySelector("ul");
      BUS.collapsable(dTrigger, dTarget);
      //console.log(paths[n]);
    }

    /* Reload button */
    BUS.initReload();

    /*
    var eResize = new Event("resize");
    window.addEventListener("resize", BUS.calcCanvasSize, false);
    window.dispatchEvent(eResize);
    */
  },
  showArticle : function(idArticle) {
    console.log("showArticle", idArticle);
    var status = "home-list";
    BUS.homeArticles.forEach(function (article) {
      if (article.id === idArticle && !article.selected) {
        article.dom.classList.add("on");
        article.dom.classList.remove("off");
        article.selected = true;
        status = "home-option";
      }
      else {
        article.dom.classList.add("off");
        article.dom.classList.remove("on");
        article.selected = false;
      }
    });

    BUS.setStatus(status);

  },
  submitArticle : function(idArticle) {
    console.log("submitArticle", idArticle);
  },
  setStatus :function (newStatus) {
    BUS.app.dom.classList.remove(BUS.app.status);
    BUS.app.status = newStatus;
    BUS.app.dom.classList.add(BUS.app.status);
  },
  initGoBack : function (context) {
    var oBack = context.querySelector(".linkHome");
    if (oBack) {
      oBack.addEventListener("click", BUS.goBack, false);
    }
  },
  goBack : function(e) {
    if (window.history && window.history.length > 1) {
      window.history.back();
      e.preventDefault();
    }
  },
  calcCanvasSize : function() {
    BUS.canvasHeight = document.documentElement.clientHeight;
  },
  collapsable : function(dTrigger, dTarget, params) {
    dTrigger.classList.add("collapsableTrigger");
    dTarget.classList.add("collapsableTarget");
    //dTrigger.dataset.collapsableTarget = dTarget;
    var collapseData = {
      "dTarget" : dTarget,
      "visibleTarget" : false
    }
    dTrigger.collapseData = collapseData;
    dTrigger.addEventListener('click', BUS.collapsableClick, false);

    BUS.collapsableRender(dTrigger);
    //console.log("collapsable", dTrigger, dTarget, params);
  },
  collapsableClick : function(evnt) {
    this.collapseData.visibleTarget = !this.collapseData.visibleTarget;
    BUS.collapsableRender(this);

  },
  collapsableRender : function(dTrigger) {
    if(dTrigger.collapseData.visibleTarget) {
      dTrigger.collapseData.dTarget.classList.add("visible")
      dTrigger.collapseData.dTarget.classList.remove("hidden");
      /*
      window.setTimeout(function() {
          dTrigger.collapseData.dTarget.classList.add("visible")
        }, 500);
      */
    }
    else {
      dTrigger.collapseData.dTarget.classList.add("hidden");
      dTrigger.collapseData.dTarget.classList.remove("visible");
    }
    //console.log("KLIK", dTrigger.collapseData.visibleTarget);
  },
  initReload : function () {
    window.clearInterval(BUS.reloadTimeoutID); // Kill old reload timer
    var oReloadWrapper = document.getElementById("reload");
    if (BUS.reloadeable && oReloadWrapper) {
      var oReload = oReloadWrapper.querySelector("a");
      oReload.addEventListener("click", BUS.reloadTime, false);
      BUS.reloadTimeoutID = window.setTimeout(function() {
        BUS.reloadTime.call(oReload);
      }, 30000);
    }
  },
  reloadTime : function(e) {
    this.classList.add("loading");
    if (e !== undefined) {
      e.preventDefault();
    }
    BUS.ajaxLink(this.href, "secBusStop", true);
  },
  ajaxSubmit : function (oFormElement, sectionTarget) {
    if (!oFormElement.action) { return; }
    var oReq = new XMLHttpRequest();
    oReq.onload = function() {
      BUS.ajaxSearch(sectionTarget, this.responseText);
    }
    if (oFormElement.method.toLowerCase() === "post") {
      oReq.open("post", oFormElement.action, true);
      oReq.send(new FormData(oFormElement));
    } else {
      var oField, sFieldType, nFile, sSearch = "";
      for (var nItem = 0; nItem < oFormElement.elements.length; nItem++) {
        oField = oFormElement.elements[nItem];
        if (!oField.hasAttribute("name")) { continue; }
        sFieldType = oField.nodeName.toUpperCase() === "INPUT" ? oField.getAttribute("type").toUpperCase() : "TEXT";
        if (sFieldType === "FILE") {
          for (nFile = 0; nFile < oField.files.length; sSearch += "&" + escape(oField.name) + "=" + escape(oField.files[nFile++].name));
        } else if ((sFieldType !== "RADIO" && sFieldType !== "CHECKBOX") || oField.checked) {
          sSearch += "&" + escape(oField.name) + "=" + escape(oField.value);
        }
      }
      var ajaxUrl = oFormElement.action.replace(/(?:\?.*)?$/, sSearch.replace(/^&/, "?")); // change first & by ?
      BUS.ajaxLink(ajaxUrl, sectionTarget);
    }
  },
  ajaxLink : function(url, sectionTarget, hideToHistory) {
    //console.log("ajaxLink", url, sectionTarget);
    // Prevent app: protocol
    if (BUS.enviroment == "app:") {
      url = url.replace("app:", BUS.externalProtocol);
    }
    var oReq = new XMLHttpRequest();
    var params = {
      url : url
    }
    params.hideToHistory = (hideToHistory === true);
    oReq.onload = function() {
      BUS.ajaxSearch(sectionTarget, this.responseText, params);
    }
    url += "&v=ajax";
    oReq.open("get", url, true);
    oReq.send(null);
    BUS.showInfo ("loading", "Recibiendo datos de la EMT...");
  },
  ajaxSearch : function (section, dataSearch, params) {
    // Hidde all sections except result target
    var sections = document.querySelectorAll("#secHome, #secNearbyStop, #secBusStop, #secBusNumber"); // TODO tenerlo precalculado
    var numSections = sections.length;
    for (var n = 0; n < numSections; n++) {
      sections[n].classList.add("hidden");
    }
    var sectionTarget = document.querySelector("#" + section);
    sectionTarget.classList.remove("hidden");
    switch (section) {
      case "secHome":
        BUS.reloadeable = false;
        BUS.updateSection (section, dataSearch, params);
        // refresh bookmarks
        HOME.loadFrecencyList();
        break;
      case "secNearbyStop":
          //console.log ("el número de parada", section, dataSearch);
          BUS.reloadeable = false;
          BUS.updateSection (section, dataSearch, params);
          break;
      case "secBusNumber":
        BUS.reloadeable = false;
        //console.log ("el número de bus", section, dataSearch);
        BUS.updateSection (section, dataSearch, params);
        // TODO
        var paths = document.querySelectorAll(".stopsLine");
        for (var n = 0; n < paths.length; n++) {
          var dTrigger = paths[n].querySelector("h1");
          var dTarget = paths[n].querySelector("ul");
          BUS.collapsable(dTrigger, dTarget);
            //console.log(paths[n]);
        }
        /* Links to stop via ajax */
        var itemsA = sectionTarget.querySelectorAll(".busStop");
        for (var n = 0; n < itemsA.length; n++) {
            itemsA[n].addEventListener("click", BUS.loadBusStop);
        }
        break;
      case "secBusStop":
        //console.log ("el número de parada", section, dataSearch);
        BUS.reloadeable = true;
        BUS.updateSection (section, dataSearch, params);
        break;
    }
    BUS.initReload();
    BUS.hiddeInfo();
  },
  loadBusStop : function(event) { // Prevent multiple asignations (anonymous function)
    BUS.ajaxLink(this.href, "secBusStop");
    event.preventDefault();
  },
  updateSection : function (section, content, params) {
    // null content only change to this section
    if (content !== null) {
      if (params.hideToHistory !== true) {
        BUS.updateHistory(section, params.url);
      }
      // console.log("entro",document.getElementById(section));
      var target = document.getElementById(section);
      target.innerHTML = content;
      BOOKMARKS.initPlaceHolder(target);
      BUS.initGoBack(target);
    }

    // Hide all sections except result target
    //console.log(section, content);
    for (var n=0; n < BUS.sections.length; n++) {
      var currentSection = document.getElementById(BUS.sections[n]);
      if (currentSection) {
        if(BUS.sections[n] === section) {
          currentSection.classList.remove("hidden");
        }
        else {
          currentSection.classList.add("hidden");
        }
      }
    }
  },
  updateHistory : function(section, url) {
    var stateObj = {sect: section};
    // TODO: implement history for app: protocol
    if (BUS.enviroment == "http:" || BUS.enviroment == "https:") {
      history.pushState(stateObj, "Search result", url);
    }
  },
  showInfo: function(action, content) {
    VIEW.info.innerHTML = content;
    VIEW.info.classList.add("visible");
  },
  hiddeInfo: function() {
    VIEW.info.classList.remove("visible");
  }
}

var BOOKMARKS = {
  bookmarksList : null,
  dFrecencyLists : null,
  inEditMode : false,
  oSortable : null,
  init : function() {
    BOOKMARKS.bookmarksList = [];
    // Initial load from persisten storage
    if (localStorage.getItem("bookmarksList")) {
      BOOKMARKS.bookmarksList = JSON.parse(localStorage.getItem("bookmarksList"));
      BOOKMARKS.purge();
      BOOKMARKS.save();
    }

    /* Personalized stop titles */
    var titles = document.querySelectorAll(".js-title");
    for (var n = 0; n < titles.length; n++) {
      BOOKMARKS.customTitle(titles[n]);
    }

    BOOKMARKS.initPlaceHolder(document);
    //console.log(bookmarks);
  },
  initPlaceHolder: function(context) {
    // Attach events
    var bookmarks = context.querySelectorAll(".js-bookmark");
    for (var item of bookmarks) {
      item.addEventListener("click", BOOKMARKS.select);
      BOOKMARKS.drawStarStatus(item);
    }
  },
  getIdStop: function(domNode) {
    return domNode.dataset.idstop;
  },
  getTitleStop: function(domNode) {
    return domNode.dataset.titlestop;
  },
  drawStarStatus: function(domNode) {
    var idStop = BOOKMARKS.getIdStop(domNode);
    if (BOOKMARKS.getIsBookmarked(idStop) > -1) {
      domNode.innerHTML = "★";
      // crossbrowsing https://developer.mozilla.org/en-US/docs/Web/API/element.classList
      domNode.classList.add("starred");
      domNode.classList.remove("unstarred");
    }
    else {
      domNode.innerHTML = "☆";
      domNode.classList.add("unstarred");
      domNode.classList.remove("starred");
    }
  },
  getIsBookmarked: function(idStop) {
    var pos = -1
    var n;
    var size  = BOOKMARKS.length();
    for(n=0; n < size; n++) {
      if (BOOKMARKS.bookmarksList[n].idStop == idStop) {
        pos = n;
        break;
      }
    }
    return pos; // -1 no bookmarked
  },
  addToBookmark: function(idStop, data) {
    // TODO
    var stop = {
      'idStop' : idStop,
      'data' : data
    };
    var pos = BOOKMARKS.getIsBookmarked(idStop);

    if (pos === -1) {
      BOOKMARKS.bookmarksList.push(stop);
    }
    else {
      BOOKMARKS.bookmarksList[pos] = stop;
    }
    BOOKMARKS.save();
    return true;

  },
  deleteFromBookmark: function(idStop) {
    //console.log("delete", idStop);
    var index = BOOKMARKS.getIsBookmarked(idStop);
    if (index > -1) {
      BOOKMARKS.bookmarksList.splice(index, 1);
      BOOKMARKS.save();
      return true;
    }
    else {
      return false;
    }
  },
  getBookmark: function(idStop) {
    var pos = BOOKMARKS.getIsBookmarked(idStop);

    return pos === -1 ? null : BOOKMARKS.bookmarksList[pos];
  },
  length: function() {
    return BOOKMARKS.bookmarksList.length;
  },
  save: function() {
      // Save in persistent storage
      localStorage.setItem("bookmarksList", JSON.stringify(BOOKMARKS.bookmarksList));
  },
  select: function(e) {
    var result = false;
    var idStop = BOOKMARKS.getIdStop(this);
    var data = {"title": BOOKMARKS.getTitleStop(this)};
    // It's bookmarked
    if (BOOKMARKS.getIsBookmarked(idStop) === -1) {
      // Try add, if is ok change to filled star
      result = BOOKMARKS.addToBookmark(idStop, data) === true;
    }
    else {
      result = BOOKMARKS.deleteFromBookmark(idStop) === true;
    }

    if (result) {
      BOOKMARKS.drawStarStatus(this);
    }


    //console.log("Seleccionado", this, BOOKMARKS.getIdStop(this));

  },
  setEditWapper: function(dEdit) {
    BOOKMARKS.dFrecencyLists = dEdit;
    BOOKMARKS.inEditMode = false
  },
  toEditMode: function(event) {
    if (BOOKMARKS.inEditMode) {
      // Copy titles to bookmarks list and save
      var inputs = BOOKMARKS.dFrecencyLists.querySelectorAll("input.editable");
      var idStop, dataStop, stopLink;
      forEach.call (inputs, function (input){
        idStop = input.dataset.idstop;
        dataStop = BOOKMARKS.getBookmark(idStop);
        if (dataStop) {// Check dataStop is currently in bookmarks
          // TODO: repasar cuando no está en bookmarks (estrella quitada)
          dataStop.title = input.value;
          stopLink = BOOKMARKS.dFrecencyLists
            .querySelector(".toBus[data-idstop='"+idStop+"']");

          stopLink.innerHTML = "";
          stopLink.appendChild(document.createTextNode(input.value));
          BOOKMARKS.addToBookmark(idStop, dataStop);
          //console.log(idStop, dataStop, input.value);
        }
      });
      BOOKMARKS.dFrecencyLists.classList.remove("editMode");
      BOOKMARKS.inEditMode = false;

      /* Sortable list */
      BOOKMARKS.oSortable.destroy();
    }
    else {
      BOOKMARKS.dFrecencyLists.classList.add("editMode");
      BOOKMARKS.inEditMode = true;

      /* Sortable list */
      var ulBookmarks = BOOKMARKS.dFrecencyLists.querySelector(".js-sortable");
      BOOKMARKS.oSortable = new Sortable(ulBookmarks , {
        handle: ".sortable",
        onUpdate: function (){
          // Build new sorted array of idStops
          var newOrderedItems = ulBookmarks.querySelectorAll(".js-bookmark");
          var total = newOrderedItems.length;
          var idStop, nodeStop;
          for (var n=0; n < total; n++) {
            idStop = newOrderedItems.item(n).dataset.idstop;
            nodeStop = BOOKMARKS.getBookmark(idStop);
            BOOKMARKS.deleteFromBookmark(idStop);
            BOOKMARKS.addToBookmark(idStop, nodeStop.data);
          }
          BOOKMARKS.save();
        }
      });
    }
    event.preventDefault();
  },
  customTitle: function(oNode) {
    var idStop = oNode.dataset.idstop;
    if (BOOKMARKS.getIsBookmarked(idStop) > -1) {
      var bookmark = BOOKMARKS.getBookmark(idStop);
      oNode.innerHTML = "";
      oNode.appendChild(document.createTextNode(bookmark.data.title));
      document.querySelector(".js-bookmark[data-idstop='"+idStop+"']").dataset.titlestop = bookmark.data.title;
    }
  },
  purge: function() {
    var n;
    var size  = BOOKMARKS.length();
    for(n=0; n < size; n++) {
      if (typeof(BOOKMARKS.bookmarksList[n]) !== "object" ) {
        BOOKMARKS.bookmarksList.splice(n, 1);
      }
    }
  }
}


var HOME = {
  dLatitude : null,
  dLongitude : null,
  init : function() {
    // Geolocation buttom
    HOME.dLatitude = document.querySelector("#idLatitude");
    HOME.dLongitude = document.querySelector("#idLongitude");
    var geoInfo = document.querySelector("#geoInfo button");
    if ("geolocation" in navigator) {
      var kk = function() { console.log("finalizado")};
      //HOME.setGeoPosition(kk);
      var formNearby = document.querySelector("#geoInfo form");
      if (formNearby) {
        formNearby.addEventListener("submit", function(event) {
          event.preventDefault();
          HOME.setGeoPosition(function() {
            BUS.ajaxSubmit(formNearby, "secNearbyStop");
          });
        }, false);
      }
    } else {
      /* geolocation IS NOT available */
      document.getElementById("geoInfo").className = 'js-hide';
    }
    // Search forms
    var formStop = document.querySelector("#busStop form");
    if (formStop) {
      formStop.addEventListener("submit", function(event) {
        var dataSearch = {"id" : formStop.querySelector("input[name=id]").value};
        //BUS.ajaxSearch("secBusStop", dataSearch);
        event.preventDefault();
        BUS.ajaxSubmit(this, "secBusStop");
      }, false);
    }

    var formNumber = document.querySelector("#busNumber form");
    if (formNumber) {
      formNumber.addEventListener("submit", function(event) {
        var dataSearch = {"id" : formNumber.querySelector("input[name=id]").value};
        //BUS.ajaxSearch("secBusNumber", dataSearch);
        event.preventDefault();
        BUS.ajaxSubmit(this, "secBusNumber");
      }, false);
    }

    HOME.loadFrecencyList();
  },
  loadFrecencyList : function() {
    // Frecency list
    var frecencyWrapper = document.getElementById("frecencyWrapper");
    var frecencyList = document.getElementById("frecencyList");
    var bookmarksSize = BOOKMARKS.length();
    if (frecencyList && bookmarksSize > 0) {
      /*
        <article id="frecencyList">
          <h1>Frecuentes</h1>
          <ul class="js-sortable">
            <li>...</li>
          </ul>
        </article>
      */
      var tmp,
        tmp2;
      var urlBusStop = frecencyWrapper.dataset.action;
      var editButton = document.createElement("a");
      editButton.setAttribute("class", "edit");
      tmp = document.createTextNode("✎");
      editButton.appendChild(tmp);
      frecencyList.appendChild(editButton);
/*
      var frecencyResult = document.createElement("article");
      frecencyResult.setAttribute("id", "º");

      var title = document.createElement("h1");
      tmp = document.createTextNode("Frecuentes");
      title.appendChild(tmp);
      var modify = document.createElement("a");
      modify.setAttribute("class", "edit");
      modify.setAttribute("href", "#");
      tmp = document.createTextNode("✎");
      modify.appendChild(tmp);
      modify.addEventListener("click", BOOKMARKS.toEditMode, false);
      title.appendChild(modify);
      frecencyResult.appendChild(title);
      */
      var list = document.createElement("ul");
      list.setAttribute("class", "js-sortable");
      var itemLi,
        itemAddBookmark,
        itemSort,
        itemA,
        itemInput;
      var idStop;
      for(var n = 0; n < bookmarksSize; n++) {
        idStop = BOOKMARKS.bookmarksList[n].idStop;
        itemLi = document.createElement("li");



          // <a class="js-bookmark bookmark only-js" data-idstop="'.$stop->getStop().'" data-titlestop="'.htmlspecialchars($stop->getDescription()).'">☆</a>
        // add favorites
        itemAddBookmark = document.createElement("a");
        itemAddBookmark.setAttribute("class", "js-bookmark bookmark only-js");
        itemAddBookmark.dataset.idstop = idStop;
        itemAddBookmark.dataset.titlestop = BOOKMARKS.bookmarksList[n].data.title;
        tmp = document.createTextNode("☆");
        itemAddBookmark.appendChild(tmp);
        itemLi.appendChild(itemAddBookmark);

        // Stop link
        itemA = document.createElement("a");
        if (BOOKMARKS.bookmarksList[n].data) {
          tmp = document.createTextNode(BOOKMARKS.bookmarksList[n].data.title);
          itemA.appendChild(tmp);
        }
        itemA.setAttribute("href", urlBusStop+"?id="+idStop);
        itemA.setAttribute("class", "toBus");
        itemA.dataset.idstop = idStop;
        itemA.addEventListener("click", function(event) {
          BUS.ajaxLink(this.href, "secBusStop");
          event.preventDefault();
        })
        itemLi.appendChild(itemA);

        // Edit favorite description
        itemInput = document.createElement("input");
        itemInput.setAttribute("type", "text");
        itemInput.setAttribute("class", "editable")
        itemInput.setAttribute("value", BOOKMARKS.bookmarksList[n].data.title);
        itemInput.dataset.idstop = idStop;
        itemLi.appendChild(itemInput);

        // <span class="sortable only-js">↕</span>
        // Drag and sort ☰ ↕
        itemSort = document.createElement("span");
        itemSort.setAttribute("class", "sortable only-js");
        tmp = document.createTextNode("=");
        itemSort.appendChild(tmp);
        itemLi.appendChild(itemSort);

        list.appendChild(itemLi);
      }

      document.getElementById("frecencyList").appendChild(list);

      //frecencyResult.appendChild(list);
      //frecencyWrapper.innerHTML = "";
      //frecencyWrapper.appendChild(frecencyResult);

      BOOKMARKS.setEditWapper(document.getElementById("frecencyList"));
      BOOKMARKS.initPlaceHolder(frecencyWrapper);

      //console.log(frecencyResult);
    }
  },
  setGeoPosition : function(callback, params) {
    navigator.geolocation.getCurrentPosition(function(position) {
      HOME.dLatitude.value = position.coords.latitude;
      HOME.dLongitude.value = position.coords.longitude;
      if (typeof callback === "function") {
        callback.apply(this, params);
      }
    });
  }
}

/* Meter class js al elemento html */
var isSupported = document.getElementById && document.getElementsByTagName;
if (isSupported) {
  document.documentElement.className = "js";
}


// http://stackoverflow.com/questions/9899372/pure-javascript-equivalent-to-jquerys-ready-how-to-call-a-function-when-the
// https://developer.mozilla.org/es/docs/Cat%C3%A1logo/algoritmo_frecency
(function() {
  VIEW.init();
  BUS.init();
  BOOKMARKS.init();
  HOME.init();

})();

/*
window.addEventListener('pageshow', function(event) {

    HOME.init();
    console.log('!');

}, false);
*/
/*
window.onload = function() {
history.pushState({page: 2}, "title", "?push");
//history.replaceState({page: 1}, "Título", "?replace");
}

window.onpopstate = function(event) {
  console.log("pathname: "+location.pathname, JSON.stringify(event.state));
}
*/
/*
history.pushState(null, "Home", '?push');

var test = document.getElementById("test");
test.addEventListener("click", function(event) {
  alert(localStorage.getItem("bookmarksList"));
});

*/
window.addEventListener('popstate', function(event) {
  //alert('¡');
  if (event.state) {
      BUS.ajaxSearch(history.state.sect, null);
  }
}, false);
