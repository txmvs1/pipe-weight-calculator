var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Třída pro kalkulačku hmotnosti potrubí
var PipeWeightCalculator = /** @class */ (function () {
    function PipeWeightCalculator() {
        var _this = this;
        this.pipeTypeSelect = document.createElement('select');
        this.pipeDiameterSelect = document.createElement('select');
        this.pipeLengthInput = document.createElement('input');
        this.filledWithWaterCheckbox = document.createElement('input');
        this.hasInsulationCheckbox = document.createElement('input');
        this.insulationOptions = document.createElement('div');
        this.insulationTypeSelect = document.createElement('select');
        this.insulationThicknessGroup = document.createElement('div');
        this.insulationThicknessSelect = document.createElement('select');
        this.pipeWeightElement = document.createElement('div');
        this.waterWeightElement = document.createElement('div');
        this.insulationWeightElement = document.createElement('div');
        this.totalWeightElement = document.createElement('div');
        // Canvas pro vykreslení schématu
        this.pipeCanvas = document.createElement('canvas');
        this.canvasContext = null;
        this.WATER_DENSITY = 1000;
        // Nejprve načteme data a pak inicializujeme UI
        this.loadDatabase().then(function () {
            _this.initElements();
            _this.setupEventListeners();
            _this.populatePipeTypes();
            _this.updatePipeDiameters();
            _this.populateInsulationTypes();
            _this.insulationOptions.style.display = "block";
            _this.insulationThicknessGroup.style.display = "block";
            _this.calculateWeight(); // Initial calculation
            _this.drawPipeSchematic(); // Initial drawing
        });
    }
    // Načtení databáze z externího JSON souboru
    PipeWeightCalculator.prototype.loadDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('pipe-database.json')];
                    case 1:
                        response = _b.sent();
                        if (!response.ok) {
                            throw new Error("HTTP error! status: ".concat(response.status));
                        }
                        _a = this;
                        return [4 /*yield*/, response.json()];
                    case 2:
                        _a.database = _b.sent();
                        this.WATER_DENSITY = this.database.constants.WATER_DENSITY;
                        console.log("Database successfully loaded");
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error loading database:", error_1);
                        alert("Failed to load database, application may not work properly.");
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PipeWeightCalculator.prototype.initElements = function () {
        // DOM elementy
        this.pipeTypeSelect = document.getElementById("pipeType");
        if (!this.pipeTypeSelect) {
            throw new Error("Element with ID 'pipeType' not found");
        }
        this.pipeDiameterSelect = document.getElementById("pipeDiameter");
        this.pipeLengthInput = document.getElementById("pipeLength");
        this.filledWithWaterCheckbox = document.getElementById("filledWithWater");
        this.hasInsulationCheckbox = document.getElementById("hasInsulation");
        this.insulationOptions = document.getElementById("insulationOptions");
        this.insulationTypeSelect = document.getElementById("insulationType");
        this.insulationThicknessGroup = document.getElementById("insulationThicknessGroup");
        this.insulationThicknessSelect = document.getElementById("insulationThickness");
        // Results
        this.pipeWeightElement = document.getElementById("pipeWeight");
        this.waterWeightElement = document.getElementById("waterWeight");
        this.insulationWeightElement = document.getElementById("insulationWeight");
        this.totalWeightElement = document.getElementById("totalWeight");
        //Canvas
        this.pipeCanvas = document.getElementById("pipeCanvas");
        this.canvasContext = this.pipeCanvas.getContext("2d");
    };
    PipeWeightCalculator.prototype.setupEventListeners = function () {
        var _this = this;
        var updateAndRedraw = function () {
            _this.calculateWeight();
            _this.drawPipeSchematic();
        };
        this.pipeTypeSelect.addEventListener("change", function () {
            _this.updatePipeDiameters();
            updateAndRedraw();
        });
        this.pipeDiameterSelect.addEventListener("change", function () {
            _this.updatePipeInfo();
            updateAndRedraw();
        });
        this.pipeLengthInput.addEventListener("input", updateAndRedraw);
        this.filledWithWaterCheckbox.addEventListener("change", updateAndRedraw);
        this.hasInsulationCheckbox.addEventListener("change", function () {
            _this.toggleInsulationOptions();
            updateAndRedraw();
        });
        this.insulationTypeSelect.addEventListener("change", updateAndRedraw);
        this.insulationThicknessSelect.addEventListener("change", updateAndRedraw);
    };
    // Filling the dropdown menu with pipe types
    PipeWeightCalculator.prototype.populatePipeTypes = function () {
        this.pipeTypeSelect.innerHTML = "";
        var entries = Object.entries || function (obj) {
            return Object.keys(obj).map(function (key) { return [key, obj[key]]; });
        };
        for (var _i = 0, _a = entries(this.database.pipeTypes); _i < _a.length; _i++) {
            var _b = _a[_i], typeId = _b[0], typeData = _b[1];
            var option = document.createElement("option");
            option.value = typeId;
            option.textContent = typeData.name;
            this.pipeTypeSelect.appendChild(option);
        }
    };
    // Filling the dropdown menu with insulation types
    PipeWeightCalculator.prototype.populateInsulationTypes = function () {
        this.insulationTypeSelect.innerHTML = "";
        for (var _i = 0, _a = Object.entries(this.database.insulationTypes); _i < _a.length; _i++) {
            var _b = _a[_i], typeId = _b[0], typeData = _b[1];
            var option = document.createElement("option");
            option.value = typeId;
            option.textContent = typeData.name;
            this.insulationTypeSelect.appendChild(option);
        }
    };
    // Updating the list of pipe diameters based on the selected type
    PipeWeightCalculator.prototype.updatePipeDiameters = function () {
        var selectedType = this.pipeTypeSelect.value;
        var sizes = this.database.pipeTypes[selectedType].sizes;
        // Clearing existing options
        this.pipeDiameterSelect.innerHTML = "";
        // Adding new options
        for (var _i = 0, _a = Object.entries(sizes); _i < _a.length; _i++) {
            var _b = _a[_i], size = _b[0], params = _b[1];
            var option = document.createElement("option");
            option.value = size;
            option.textContent = "DN".concat(size, " (").concat(params.pipeOuterDiameter, " x ").concat(params.wallThickness, ")");
            this.pipeDiameterSelect.appendChild(option);
        }
        // Displaying pipe information
        this.updatePipeInfo();
    };
    // Showing/hiding insulation options
    PipeWeightCalculator.prototype.toggleInsulationOptions = function () {
        if (this.hasInsulationCheckbox.checked) {
            this.insulationOptions.style.display = "block";
            this.insulationThicknessGroup.style.display = "block";
        }
        else {
            this.insulationOptions.style.display = "none";
        }
    };
    // Updating pipe information
    PipeWeightCalculator.prototype.updatePipeInfo = function () {
        var selectedType = this.pipeTypeSelect.value;
        var selectedSize = this.pipeDiameterSelect.value;
        var pipeData = this.database.pipeTypes[selectedType];
        var sizeData = pipeData.sizes[selectedSize];
        var pipeOuterDiameter = sizeData.pipeOuterDiameter;
        var wallThickness = sizeData.wallThickness;
        var innerDiameter = pipeOuterDiameter - 2 * wallThickness;
        this.pipeInfo = {
            type: pipeData.name,
            size: "DN".concat(selectedSize),
            outerDiameter: pipeOuterDiameter,
            wallThickness: wallThickness,
            innerDiameter: innerDiameter.toFixed(2),
            density: pipeData.density
        };
        // Displaying pipe information
        console.log("Pipe info updated:", this.pipeInfo);
    };
    // Weight calculation
    PipeWeightCalculator.prototype.calculateWeight = function () {
        // Checking if data is loaded
        if (!this.database) {
            console.error("Database is not loaded");
            return;
        }
        var selectedType = this.pipeTypeSelect.value;
        var selectedSize = this.pipeDiameterSelect.value;
        var pipeLength = parseFloat(this.pipeLengthInput.value);
        var filledWithWater = this.filledWithWaterCheckbox.checked;
        var hasInsulation = this.hasInsulationCheckbox.checked;
        // Validating input
        if (isNaN(pipeLength) || pipeLength <= 0) {
            this.pipeWeightElement.textContent = "0 kg";
            this.waterWeightElement.textContent = "0 kg";
            this.insulationWeightElement.textContent = "0 kg";
            this.totalWeightElement.textContent = "0 kg";
            return;
        }
        // Pipe data
        var pipeData = this.database.pipeTypes[selectedType];
        var sizeData = pipeData.sizes[selectedSize];
        var pipeOuterDiameter = sizeData.pipeOuterDiameter / 1000; // mm -> m
        var wallThickness = sizeData.wallThickness / 1000; // mm -> m
        var innerDiameter = pipeOuterDiameter - 2 * wallThickness;
        // Calculating pipe material volume (m³)
        var pipeVolume = Math.PI * (Math.pow(pipeOuterDiameter / 2, 2) - Math.pow(innerDiameter / 2, 2)) * pipeLength;
        // Pipe weight (kg)
        var pipeWeight = pipeVolume * pipeData.density;
        // Water weight (kg)
        var waterWeight = 0;
        if (filledWithWater) {
            var waterVolume = Math.PI * Math.pow(innerDiameter / 2, 2) * pipeLength;
            waterWeight = waterVolume * this.WATER_DENSITY;
        }
        // Insulation weight (kg)
        var insulationWeight = 0;
        if (hasInsulation) {
            var insulationType = this.insulationTypeSelect.value;
            var insulationThickness = parseInt(this.insulationThicknessSelect.value) / 1000; // mm -> m
            var insulationOuterDiameter = pipeOuterDiameter + 2 * insulationThickness;
            // Insulation volume (m³)
            var insulationVolume = Math.PI * (Math.pow(insulationOuterDiameter / 2, 2) - Math.pow(pipeOuterDiameter / 2, 2)) * pipeLength;
            // Insulation weight (kg)
            insulationWeight = insulationVolume * this.database.insulationTypes[insulationType].density;
        }
        // Total weight
        var totalWeight = pipeWeight + waterWeight + insulationWeight;
        // Updating results
        this.pipeWeightElement.textContent = pipeWeight.toFixed(2) + " kg";
        this.waterWeightElement.textContent = waterWeight.toFixed(2) + " kg";
        this.insulationWeightElement.textContent = insulationWeight.toFixed(2) + " kg";
        this.totalWeightElement.textContent = totalWeight.toFixed(2) + " kg";
    };
    // Vykreslení schématu potrubí pomocí Canvas
    PipeWeightCalculator.prototype.drawPipeSchematic = function () {
        if (!this.canvasContext) {
            console.error("Canvas context is not available");
            return;
        }
        var ctx = this.canvasContext;
        var canvas = this.pipeCanvas;
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        // Vyčištění plátna
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Získání dat potrubí
        var selectedType = this.pipeTypeSelect.value;
        var selectedSize = this.pipeDiameterSelect.value;
        var hasInsulation = this.hasInsulationCheckbox.checked;
        var filledWithWater = this.filledWithWaterCheckbox.checked;
        // Pipe data
        var pipeData = this.database.pipeTypes[selectedType];
        var sizeData = pipeData.sizes[selectedSize];
        var pipeOuterDiameter = sizeData.pipeOuterDiameter;
        var wallThickness = sizeData.wallThickness;
        var innerDiameter = pipeOuterDiameter - 2 * wallThickness;
        // Tloušťka izolace
        var insulationThickness = 0;
        if (hasInsulation) {
            insulationThickness = parseInt(this.insulationThicknessSelect.value);
        }
        // Konstanty pro vykreslení - pro zobrazení v měřítku
        var scale = 1;
        // Poloměry pro vykreslení
        var outerRadius = 75;
        var innerRadius = 60;
        var insulationRadius = 130;
        // Vykreslení izolace, pokud je zaškrtnuto
        if (hasInsulation) {
            // Vykreslení izolace
            ctx.beginPath();
            ctx.arc(centerX, centerY, insulationRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#cccccc';
            ctx.fill();
            // Přidání vzoru izolace
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, insulationRadius, 0, Math.PI * 2);
            ctx.clip();
            // Vykreslení vzoru mřížky
            ctx.strokeStyle = '#999999';
            ctx.lineWidth = 1;
            var spacing = 15;
            // Vykreslení čar v úhlu 45 stupňů
            for (var i = -canvas.width; i <= canvas.width * 2; i += spacing) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + canvas.width, canvas.width);
                ctx.stroke();
            }
            // Vykreslení čar v úhlu 135 stupňů
            for (var i = -canvas.width; i <= canvas.width * 2; i += spacing) {
                ctx.beginPath();
                ctx.moveTo(i, canvas.width);
                ctx.lineTo(i + canvas.width, 0);
                ctx.stroke();
            }
            ctx.restore();
        }
        // Vykreslení vnější stěny potrubí
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#666666';
        ctx.fill();
        // Vykreslení vnitřní stěny potrubí (prázdná nebo vodní plocha dle nastavení)
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = filledWithWater ? '#00ccff' : '#f5f5f5'; // Modrá pro vodu, světle šedá pro prázdné potrubí
        ctx.fill();
        // Vykreslení středových čar
        ctx.strokeStyle = 'red';
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 0.75;
        // Horizontální středová čára
        ctx.beginPath();
        ctx.moveTo(centerX - insulationRadius - 5, centerY);
        ctx.lineTo(centerX + insulationRadius + 5, centerY);
        ctx.stroke();
        // Vertikální středová čára
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - insulationRadius - 5);
        ctx.lineTo(centerX, centerY + insulationRadius + 5);
        ctx.stroke();
        // Vykreslení rozměrových čar
        ctx.setLineDash([]);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 0.75;
        // Vnější průměr - horní kóta
        var topLine = centerY - insulationRadius - 10;
        // Vykreslení horizontální čáry vnějšího průměru
        ctx.beginPath();
        ctx.moveTo(centerX - outerRadius, topLine);
        ctx.lineTo(centerX + outerRadius + 5, topLine);
        ctx.stroke();
        // Levá značka pro vnější průměr - šikmá
        ctx.beginPath();
        ctx.moveTo(centerX - outerRadius - 5, topLine + 5);
        ctx.lineTo(centerX - outerRadius + 5, topLine - 5);
        ctx.stroke();
        // Pravá značka pro vnější průměr - šikmá
        ctx.beginPath();
        ctx.moveTo(centerX + outerRadius - 5, topLine + 5);
        ctx.lineTo(centerX + outerRadius + 5, topLine - 5);
        ctx.stroke();
        // Vykreslení levé vertikální čáry vnějšího průměru
        ctx.beginPath();
        ctx.moveTo(centerX - outerRadius, topLine - 5);
        ctx.lineTo(centerX - outerRadius, centerY);
        ctx.stroke();
        // Vykreslení pravé vertikální čáry vnějšího průměru
        ctx.beginPath();
        ctx.moveTo(centerX + outerRadius, topLine - 5);
        ctx.lineTo(centerX + outerRadius, centerY);
        ctx.stroke();
        // Popisek pro průměr
        ctx.font = '12px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(pipeOuterDiameter.toString() + " mm", centerX, topLine - 10);
        // Rozměr tloušťky stěny - spodní kóta
        var bottomLine = centerY + insulationRadius + 10;
        // Vykreslení horizontální čáry tloušťky stěny
        ctx.beginPath();
        ctx.moveTo(centerX + innerRadius - 5, bottomLine);
        ctx.lineTo(centerX + outerRadius + 50, bottomLine);
        ctx.stroke();
        // Vykreslení levé vertikální čáry tloušťky stěny
        ctx.beginPath();
        ctx.moveTo(centerX + innerRadius, bottomLine + 5);
        ctx.lineTo(centerX + innerRadius, centerY);
        ctx.stroke();
        // Vykreslení pravé vertikální čáry tloušťky stěny
        ctx.beginPath();
        ctx.moveTo(centerX + outerRadius, bottomLine + 5);
        ctx.lineTo(centerX + outerRadius, centerY);
        ctx.stroke();
        // Levá značka pro tloušťku stěny - šikmá
        ctx.beginPath();
        ctx.moveTo(centerX + innerRadius - 5, bottomLine + 5);
        ctx.lineTo(centerX + innerRadius + 5, bottomLine - 5);
        ctx.stroke();
        // Pravá značka pro tloušťku stěny - šikmá
        ctx.beginPath();
        ctx.moveTo(centerX + outerRadius - 5, bottomLine + 5);
        ctx.lineTo(centerX + outerRadius + 5, bottomLine - 5);
        ctx.stroke();
        // Popisek pro tloušťku stěny
        ctx.textAlign = 'left';
        ctx.fillText(wallThickness.toString() + " mm", centerX + outerRadius + 20, bottomLine - 5);
        // Vykreslení rozměru tloušťky izolace, pokud je izolováno
        if (hasInsulation) {
            // Vykreslení horizontální čáry tloušťky izolace
            ctx.beginPath();
            ctx.moveTo(centerX - insulationRadius - 5, topLine);
            ctx.lineTo(centerX - outerRadius, topLine);
            ctx.stroke();
            // Vykreslení levé vertikální čáry tloušťky izolace
            ctx.beginPath();
            ctx.moveTo(centerX - insulationRadius, topLine - 5);
            ctx.lineTo(centerX - insulationRadius, centerY);
            ctx.stroke();
            // Levá značka pro tloušťku izolace - šikmá
            ctx.beginPath();
            ctx.moveTo(centerX - insulationRadius - 5, topLine + 5);
            ctx.lineTo(centerX - insulationRadius + 5, topLine - 5);
            ctx.stroke();
            // Popisek pro tloušťku izolace
            ctx.textAlign = 'right';
            ctx.fillText(insulationThickness.toString() + " mm", centerX - outerRadius - 10, topLine - 10);
        }
    };
    return PipeWeightCalculator;
}());
// Application initialization
document.addEventListener("DOMContentLoaded", function () {
    new PipeWeightCalculator();
});
