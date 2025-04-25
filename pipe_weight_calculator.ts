// Definice typů
interface PipeSize {
    pipeOuterDiameter: number;
    wallThickness: number;
}

interface PipeTypeData {
    name: string;
    density: number;
    sizes: Record<string, PipeSize>;
}

interface InsulationType {
    name: string;
    density: number;
}

interface DatabaseSchema {
    pipeTypes: Record<string, PipeTypeData>;
    insulationTypes: Record<string, InsulationType>;
    constants: {
        WATER_DENSITY: number;
    };
}

// Třída pro kalkulačku hmotnosti potrubí
class PipeWeightCalculator {
    private pipeTypeSelect: HTMLSelectElement = document.createElement('select');
    private pipeDiameterSelect: HTMLSelectElement = document.createElement('select');
    private pipeLengthInput: HTMLInputElement = document.createElement('input');
    private filledWithWaterCheckbox: HTMLInputElement = document.createElement('input');
    private hasInsulationCheckbox: HTMLInputElement = document.createElement('input');
    private insulationOptions: HTMLElement = document.createElement('div');
    private insulationTypeSelect: HTMLSelectElement = document.createElement('select');
    private insulationThicknessGroup: HTMLElement = document.createElement('div');
    private insulationThicknessSelect: HTMLSelectElement = document.createElement('select');
    
    private pipeWeightElement: HTMLElement = document.createElement('div');
    private waterWeightElement: HTMLElement = document.createElement('div');
    private insulationWeightElement: HTMLElement= document.createElement('div');
    private totalWeightElement: HTMLElement= document.createElement('div');
    private pipeInfo: any;
    
    // Canvas pro vykreslení schématu
    private pipeCanvas: HTMLCanvasElement= document.createElement('canvas');
    private canvasContext: CanvasRenderingContext2D | null= null;

    // Data z JSON
    private database!: DatabaseSchema;
    private WATER_DENSITY: number=1000;

    constructor() {
        // Nejprve načteme data a pak inicializujeme UI
        this.loadDatabase().then(() => {
            this.initElements();
            this.setupEventListeners();
            this.populatePipeTypes();
            this.updatePipeDiameters();
            this.populateInsulationTypes();
            this.insulationOptions.style.display = "block";
            this.insulationThicknessGroup.style.display = "block";
            this.calculateWeight(); // Initial calculation
            this.drawPipeSchematic(); // Initial drawing
        });
    }

    // Načtení databáze z externího JSON souboru
    private async loadDatabase(): Promise<void> {
        try {
            const response = await fetch('pipe-database.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.database = await response.json();
            this.WATER_DENSITY = this.database.constants.WATER_DENSITY;
            console.log("Database successfully loaded");
        } catch (error) {
            console.error("Error loading database:", error);
            alert("Failed to load database, application may not work properly.");
        }
    }

    private initElements(): void {
        // DOM elementy
        this.pipeTypeSelect = document.getElementById("pipeType") as HTMLSelectElement;
        if (!this.pipeTypeSelect) {
            throw new Error("Element with ID 'pipeType' not found");
        }
        this.pipeDiameterSelect = document.getElementById("pipeDiameter") as HTMLSelectElement;
        this.pipeLengthInput = document.getElementById("pipeLength") as HTMLInputElement;
        this.filledWithWaterCheckbox = document.getElementById("filledWithWater") as HTMLInputElement;
        this.hasInsulationCheckbox = document.getElementById("hasInsulation") as HTMLInputElement;
        this.insulationOptions = document.getElementById("insulationOptions") as HTMLElement;
        this.insulationTypeSelect = document.getElementById("insulationType") as HTMLSelectElement;
        this.insulationThicknessGroup = document.getElementById("insulationThicknessGroup") as HTMLElement;
        this.insulationThicknessSelect = document.getElementById("insulationThickness") as HTMLSelectElement;

        // Results
        this.pipeWeightElement = document.getElementById("pipeWeight") as HTMLElement;
        this.waterWeightElement = document.getElementById("waterWeight") as HTMLElement;
        this.insulationWeightElement = document.getElementById("insulationWeight") as HTMLElement;
        this.totalWeightElement = document.getElementById("totalWeight") as HTMLElement;
        
        //Canvas
       
        this.pipeCanvas = document.getElementById("pipeCanvas") as HTMLCanvasElement;
        this.canvasContext = this.pipeCanvas.getContext("2d");
    }

    private setupEventListeners(): void {
        const updateAndRedraw = () => {
            this.calculateWeight();
            this.drawPipeSchematic();
        };

        this.pipeTypeSelect.addEventListener("change", () => {
            this.updatePipeDiameters();
            updateAndRedraw();
        });
        
        this.pipeDiameterSelect.addEventListener("change", () => {
            this.updatePipeInfo();
            updateAndRedraw();
        });
        
        this.pipeLengthInput.addEventListener("input", updateAndRedraw);
                this.filledWithWaterCheckbox.addEventListener("change", updateAndRedraw);
                this.hasInsulationCheckbox.addEventListener("change", () => {
            this.toggleInsulationOptions();
            updateAndRedraw();
        });
        
        this.insulationTypeSelect.addEventListener("change", updateAndRedraw);
                this.insulationThicknessSelect.addEventListener("change", updateAndRedraw);
    }

    // Filling the dropdown menu with pipe types
    private populatePipeTypes(): void {
        this.pipeTypeSelect.innerHTML = "";
        
        const entries = Object.entries || function (obj: any) {
            return Object.keys(obj).map(key => [key, obj[key]]);
        };

        for (const [typeId, typeData] of entries(this.database.pipeTypes)) {
            const option = document.createElement("option");
            option.value = typeId;
            option.textContent = typeData.name;
            this.pipeTypeSelect.appendChild(option);
        }
    }

    // Filling the dropdown menu with insulation types
    private populateInsulationTypes(): void {
        this.insulationTypeSelect.innerHTML = "";
        
        for (const [typeId, typeData] of Object.entries(this.database.insulationTypes)) {
            const option = document.createElement("option");
            option.value = typeId;
            option.textContent = typeData.name;
            this.insulationTypeSelect.appendChild(option);
        }
    }

    // Updating the list of pipe diameters based on the selected type
    private updatePipeDiameters(): void {
        const selectedType = this.pipeTypeSelect.value;
        const sizes = this.database.pipeTypes[selectedType].sizes;
        
        // Clearing existing options
        this.pipeDiameterSelect.innerHTML = "";
        
        // Adding new options
        for (const [size, params] of Object.entries(sizes)) {
            const option = document.createElement("option");
            option.value = size;
            option.textContent = `DN${size} (${params.pipeOuterDiameter} x ${params.wallThickness})`;
            this.pipeDiameterSelect.appendChild(option);
        }
        
        // Displaying pipe information
        this.updatePipeInfo();
    }

    // Showing/hiding insulation options
    private toggleInsulationOptions(): void {
        if (this.hasInsulationCheckbox.checked) {
            this.insulationOptions.style.display = "block";
            this.insulationThicknessGroup.style.display = "block";
        } else {
            this.insulationOptions.style.display = "none";
        }
    }

    // Updating pipe information
    private updatePipeInfo(): void {
        const selectedType = this.pipeTypeSelect.value;
        const selectedSize = this.pipeDiameterSelect.value;
        const pipeData = this.database.pipeTypes[selectedType];
        const sizeData = pipeData.sizes[selectedSize];
        
        const pipeOuterDiameter = sizeData.pipeOuterDiameter;
        const wallThickness = sizeData.wallThickness;
        const innerDiameter = pipeOuterDiameter - 2 * wallThickness;
        
        this.pipeInfo = {
            type: pipeData.name,
            size: `DN${selectedSize}`,
            outerDiameter: pipeOuterDiameter,
            wallThickness: wallThickness,
            innerDiameter: innerDiameter.toFixed(2),
            density: pipeData.density
        };

        // Displaying pipe information
        console.log("Pipe info updated:", this.pipeInfo);
    }

    // Weight calculation
    public calculateWeight(): void {
        // Checking if data is loaded
        if (!this.database) {
            console.error("Database is not loaded");
            return;
        }
    
        
        const selectedType = this.pipeTypeSelect.value;
        const selectedSize = this.pipeDiameterSelect.value;
        const pipeLength = parseFloat(this.pipeLengthInput.value);
        const filledWithWater = this.filledWithWaterCheckbox.checked;
        const hasInsulation = this.hasInsulationCheckbox.checked;
        
        // Validating input
        if (isNaN(pipeLength) || pipeLength <= 0) {
            this.pipeWeightElement.textContent = "0 kg";
            this.waterWeightElement.textContent = "0 kg";
            this.insulationWeightElement.textContent = "0 kg";
            this.totalWeightElement.textContent = "0 kg";
            return;
        }
        
        // Pipe data
        const pipeData = this.database.pipeTypes[selectedType];
        const sizeData = pipeData.sizes[selectedSize];
        const pipeOuterDiameter = sizeData.pipeOuterDiameter / 1000; // mm -> m
        const wallThickness = sizeData.wallThickness / 1000; // mm -> m
        const innerDiameter = pipeOuterDiameter - 2 * wallThickness;
        
        // Calculating pipe material volume (m³)
        const pipeVolume = Math.PI * (Math.pow(pipeOuterDiameter/2, 2) - Math.pow(innerDiameter/2, 2)) * pipeLength;
        
        // Pipe weight (kg)
        const pipeWeight = pipeVolume * pipeData.density;
        
        // Water weight (kg)
        let waterWeight = 0;
        if (filledWithWater) {
            const waterVolume = Math.PI * Math.pow(innerDiameter/2, 2) * pipeLength;
            waterWeight = waterVolume * this.WATER_DENSITY;
        }
        
        // Insulation weight (kg)
        let insulationWeight = 0;
        if (hasInsulation) {
            const insulationType = this.insulationTypeSelect.value;
            const insulationThickness = parseInt(this.insulationThicknessSelect.value) / 1000; // mm -> m
            const insulationOuterDiameter = pipeOuterDiameter + 2 * insulationThickness;
            
            // Insulation volume (m³)
            const insulationVolume = Math.PI * (Math.pow(insulationOuterDiameter/2, 2) - Math.pow(pipeOuterDiameter/2, 2)) * pipeLength;
            
            // Insulation weight (kg)
            insulationWeight = insulationVolume * this.database.insulationTypes[insulationType].density;
        }
        
        // Total weight
        const totalWeight = pipeWeight + waterWeight + insulationWeight;
        
        // Updating results
        this.pipeWeightElement.textContent = pipeWeight.toFixed(2) + " kg";
        this.waterWeightElement.textContent = waterWeight.toFixed(2) + " kg";
        this.insulationWeightElement.textContent = insulationWeight.toFixed(2) + " kg";
        this.totalWeightElement.textContent = totalWeight.toFixed(2) + " kg";
    }

    // Vykreslení schématu potrubí pomocí Canvas
    private drawPipeSchematic(): void {
        if (!this.canvasContext) {
            console.error("Canvas context is not available");
            return;
        }
        
        const ctx = this.canvasContext;
        const canvas = this.pipeCanvas;
        
        const centerX: number = canvas.width / 2;
        const centerY: number = canvas.height / 2;
        
        // Vyčištění plátna
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Získání dat potrubí
        const selectedType = this.pipeTypeSelect.value;
        const selectedSize = this.pipeDiameterSelect.value;
        const hasInsulation = this.hasInsulationCheckbox.checked;
        const filledWithWater = this.filledWithWaterCheckbox.checked;
        
        // Pipe data
        const pipeData = this.database.pipeTypes[selectedType];
        const sizeData = pipeData.sizes[selectedSize];
        const pipeOuterDiameter = sizeData.pipeOuterDiameter;
        const wallThickness = sizeData.wallThickness;
        const innerDiameter = pipeOuterDiameter - 2 * wallThickness;
        
        // Tloušťka izolace
        let insulationThickness = 0;
        if (hasInsulation) {
            insulationThickness = parseInt(this.insulationThicknessSelect.value);
        }
        
        // Konstanty pro vykreslení - pro zobrazení v měřítku
        const scale: number = 1;
        
        // Poloměry pro vykreslení
        const outerRadius: number = 75;
        const innerRadius: number = 60;
        const insulationRadius: number = 130;
        
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
            const spacing: number = 15;
            
            // Vykreslení čar v úhlu 45 stupňů
            for (let i = -canvas.width; i <= canvas.width * 2; i += spacing) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i + canvas.width, canvas.width);
                ctx.stroke();
            }
            
            // Vykreslení čar v úhlu 135 stupňů
            for (let i = -canvas.width; i <= canvas.width * 2; i += spacing) {
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
        const topLine: number = centerY - insulationRadius-10;
        
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
        const bottomLine: number = centerY + insulationRadius + 10;
        
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
        
    }
}

// Application initialization
document.addEventListener("DOMContentLoaded", () => {
    new PipeWeightCalculator();
});