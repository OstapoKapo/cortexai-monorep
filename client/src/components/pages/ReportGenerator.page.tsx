"use client";

import { useState, useRef } from "react";
import { FileCode, FileText, Sparkles, Upload, X, AlertCircle } from "lucide-react";
import { CustomButton } from "@/components/custom/CustomButton.component";

export function ReportGeneratorPage() {
  const [code, setCode] = useState("");
  const [instructions, setInstructions] = useState("");
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const templateInputRef = useRef<HTMLInputElement>(null);

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTemplateFile(file);
    }
  };

  const handleRemoveTemplate = () => {
    setTemplateFile(null);
    if (templateInputRef.current) {
      templateInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!code.trim()) return;
    
    setIsGenerating(true);
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const isFormValid = code.trim().length > 0;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold">Генератор звітів</h2>
        <p className="text-muted-foreground mt-1">
          Завантажте код та шаблон для автоматичної генерації звіту
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Секція коду */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <FileCode className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Ваш код</h3>
            <span className="text-destructive">*</span>
          </div>
          
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Вставте ваш код тут...&#10;&#10;function example() {&#10;  console.log('Hello World');&#10;}"
            className="flex-1 w-full bg-background border border-input rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all placeholder:text-muted-foreground"
            spellCheck={false}
          />
          
          <p className="text-xs text-muted-foreground mt-2">
            Підтримуються: JavaScript, TypeScript, Python, Java, C++, та інші
          </p>
        </div>

        {/* Секція шаблону та інструкцій */}
        <div className="flex flex-col gap-6">
          {/* Завантаження шаблону */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Шаблон звіту</h3>
              <span className="text-muted-foreground text-xs">(необов&apos;язково)</span>
            </div>

            <input
              ref={templateInputRef}
              type="file"
              accept=".docx,.doc,.pdf,.txt,.md"
              onChange={handleTemplateUpload}
              className="hidden"
              id="template-upload"
            />

            {templateFile ? (
              <div className="flex items-center justify-between bg-background border border-input rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {templateFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(templateFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveTemplate}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="template-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-input rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-accent/50 transition-all"
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-center">
                  <span className="text-primary font-medium">Натисніть для завантаження</span>
                  <br />
                  <span className="text-muted-foreground text-xs">
                    або перетягніть файл сюди
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  DOCX, PDF, TXT, MD (до 10MB)
                </p>
              </label>
            )}
          </div>

          {/* Додаткові інструкції */}
          <div className="bg-card border border-border rounded-xl p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Додаткові вказівки</h3>
            </div>
            
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Опишіть додаткові вимоги до звіту...&#10;&#10;Наприклад:&#10;- Додати блок-схему алгоритму&#10;- Описати складність O(n)&#10;- Включити приклади вхідних даних"
              className="flex-1 w-full bg-background border border-input rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Кнопка генерації */}
      <div className="flex justify-end">
        <CustomButton
          onClick={handleGenerate}
          isLoading={isGenerating}
          disabled={!isFormValid}
          className="w-full sm:w-auto px-8"
          variant="primary"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isGenerating ? "Генерація..." : "Згенерувати звіт"}
        </CustomButton>
      </div>
    </div>
  );
}
