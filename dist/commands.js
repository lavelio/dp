/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkoffice_addin_taskpane_react"] = self["webpackChunkoffice_addin_taskpane_react"] || []).push([["commands"],{

/***/ 47351:
/*!**********************************!*\
  !*** ./src/commands/commands.ts ***!
  \**********************************/
/***/ (function() {

eval("Office.onReady(() => {\n});\nfunction action(event) {\n  Office.context.ui.displayDialogAsync(\n    \"https://localhost:3000/answer_form.html\",\n    { height: 50, width: 50, displayInIframe: false },\n    (asyncResult) => {\n      if (asyncResult.status === Office.AsyncResultStatus.Failed) {\n        console.error(asyncResult.error.message);\n      } else {\n        asyncResult.value;\n      }\n    }\n  );\n  event.completed();\n}\nOffice.actions.associate(\"action\", action);\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9vZmZpY2UtYWRkaW4tdGFza3BhbmUtcmVhY3QvLi9zcmMvY29tbWFuZHMvY29tbWFuZHMudHM/Mzc0YyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWwgT2ZmaWNlIGNvbnNvbGUgKi9cblxuT2ZmaWNlLm9uUmVhZHkoKCkgPT4ge1xuICAvLyBJZiBuZWVkZWQsIE9mZmljZS5qcyBpcyByZWFkeSB0byBiZSBjYWxsZWQuXG59KTtcblxuLyoqXG4gKiBTaG93cyBhIG5vdGlmaWNhdGlvbiB3aGVuIHRoZSBhZGQtaW4gY29tbWFuZCBpcyBleGVjdXRlZC5cbiAqIEBwYXJhbSBldmVudFxuICovXG5mdW5jdGlvbiBhY3Rpb24oZXZlbnQ6IE9mZmljZS5BZGRpbkNvbW1hbmRzLkV2ZW50KSB7XG4gIC8vIGxldCBkaWFsb2c6IE9mZmljZS5EaWFsb2c7XG5cbiAgT2ZmaWNlLmNvbnRleHQudWkuZGlzcGxheURpYWxvZ0FzeW5jKFxuICAgIFwiaHR0cHM6Ly9sb2NhbGhvc3Q6MzAwMC9hbnN3ZXJfZm9ybS5odG1sXCIsXG4gICAgeyBoZWlnaHQ6IDUwLCB3aWR0aDogNTAsIGRpc3BsYXlJbklmcmFtZTogZmFsc2UgfSxcbiAgICAoYXN5bmNSZXN1bHQ6IE9mZmljZS5Bc3luY1Jlc3VsdDxPZmZpY2UuRGlhbG9nPikgPT4ge1xuICAgICAgaWYgKGFzeW5jUmVzdWx0LnN0YXR1cyA9PT0gT2ZmaWNlLkFzeW5jUmVzdWx0U3RhdHVzLkZhaWxlZCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFzeW5jUmVzdWx0LmVycm9yLm1lc3NhZ2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZGlhbG9nID1cbiAgICAgICAgYXN5bmNSZXN1bHQudmFsdWU7XG4gICAgICAgIC8vIGRpYWxvZy5hZGRFdmVudEhhbmRsZXIoXG4gICAgICAgIC8vICAgT2ZmaWNlLkV2ZW50VHlwZS5EaWFsb2dNZXNzYWdlUmVjZWl2ZWQsXG4gICAgICAgIC8vICAgKGFyZzogT2ZmaWNlLkRpYWxvZ01lc3NhZ2VSZWNlaXZlZEV2ZW50QXJncykgPT4gbWVzc2FnZUhhbmRsZXIoYXJnKSAvLyDQotC40L8g0YHQvtCx0YvRgtC40Y9cbiAgICAgICAgLy8gKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG5cbiAgZXZlbnQuY29tcGxldGVkKCk7XG59XG5cbk9mZmljZS5hY3Rpb25zLmFzc29jaWF0ZShcImFjdGlvblwiLCBhY3Rpb24pO1xuIl0sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLFFBQVEsTUFBTTtBQUVyQixDQUFDO0FBTUQsU0FBUyxPQUFPLE9BQW1DO0FBR2pELFNBQU8sUUFBUSxHQUFHO0FBQUEsSUFDaEI7QUFBQSxJQUNBLEVBQUUsUUFBUSxJQUFJLE9BQU8sSUFBSSxpQkFBaUIsTUFBTTtBQUFBLElBQ2hELENBQUMsZ0JBQW1EO0FBQ2xELFVBQUksWUFBWSxXQUFXLE9BQU8sa0JBQWtCLFFBQVE7QUFDMUQsZ0JBQVEsTUFBTSxZQUFZLE1BQU0sT0FBTztBQUFBLE1BQ3pDLE9BQU87QUFFTCxvQkFBWTtBQUFBLE1BS2Q7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLFFBQU0sVUFBVTtBQUNsQjtBQUVBLE9BQU8sUUFBUSxVQUFVLFVBQVUsTUFBTTsiLCJuYW1lcyI6W10sImZpbGUiOiI0NzM1MS5qcyIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///47351\n");

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ var __webpack_exports__ = (__webpack_exec__(47351));
/******/ }
]);