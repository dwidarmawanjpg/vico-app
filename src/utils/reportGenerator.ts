/**
 * Report Generator Utility
 * Generates CSV reports from batch data and handles sharing/download
 */

import type { Batch } from '../types/batch';
import { YieldService } from '../services/YieldService';

/**
 * Format duration from milliseconds to readable string
 */
function formatDuration(ms: number): string {
    if (ms < 0) return 'Data Error';
    if (ms === 0) return '-';
    
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        if (remainingHours > 0) {
            return `${days} Hari ${remainingHours} Jam`;
        }
        return `${days} Hari`;
    }
    
    if (hours > 0) {
        return minutes > 0 ? `${hours} Jam ${minutes} Menit` : `${hours} Jam`;
    }
    
    return `${minutes} Menit`;
}

/**
 * Format timestamp to DD/MM/YYYY HH:mm
 */
function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Format weight with smart unit selection
 */
function formatWeight(grams: number): string {
    if (grams >= 1000) {
        return `${(grams / 1000).toFixed(1)} Kg`;
    }
    return `${grams} g`;
}

/**
 * Format volume with smart unit selection
 */
function formatVolume(liters: number): string {
    if (liters >= 1) {
        return `${liters.toFixed(1)} L`;
    }
    return `${(liters * 1000).toFixed(0)} mL`;
}

/**
 * Get quality summary from QC result
 */
function getQualitySummary(batch: Batch): string {
    if (!batch.qcResult) return '-';
    
    const checks: string[] = [];
    if (batch.qcResult.qc_clear) checks.push('Jernih');
    if (batch.qcResult.qc_no_rancid_smell) checks.push('Tidak Bau');
    if (batch.qcResult.qc_oil_layer_good) checks.push('Lapisan OK');
    
    if (checks.length === 3) return 'Premium ✓';
    if (checks.length === 2) return 'Standard';
    if (checks.length === 1) return 'Perlu Review';
    return 'Tidak Lolos QC';
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSVField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
}

/**
 * Sanitize name for filename (remove spaces and special chars)
 */
function sanitizeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20) || 'Mitra';
}

/**
 * Generate CSV content from batches
 */
function generateCSVContent(batches: Batch[], userName: string): string {
    // Headers - Nama Mitra as first column
    const headers = [
        'Nama Mitra',
        'ID Batch',
        'Tanggal Selesai',
        'Durasi Aktual',
        'Input Kelapa',
        'Input Air',
        'Output VCO',
        'Yield (mL/kg)',
        'Kualitas',
        'Catatan'
    ];
    
    const rows = batches.map(batch => {
        const startTime = batch.createdAt;
        const endTime = batch.completedAt || batch.updatedAt;
        const duration = endTime - startTime;
        const vcoMl = batch.qcResult?.qc_total_vco_ml || 0;
        const yieldPerKg = batch.inputWeight > 0 
            ? YieldService.calculateEfficiency(vcoMl, batch.inputWeight) 
            : 0;
        
        return [
            userName, // First column: user name
            batch.id,
            formatDateTime(endTime),
            formatDuration(duration),
            formatWeight(batch.inputWeight),
            formatVolume(batch.waterVolume),
            `${vcoMl} mL`,
            yieldPerKg.toFixed(1),
            getQualitySummary(batch),
            batch.qcResult?.qc_notes || '-'
        ].map(escapeCSVField);
    });
    
    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
}

/**
 * Get current date formatted for filename
 */
function getFilenameDate(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}${month}${year}`;
}

/**
 * Download CSV file via DOM
 */
function downloadCSVFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Share or download batch report as CSV
 * Uses native share API with DOM download fallback
 */
export async function shareBatchReport(batches: Batch[], userName: string): Promise<{ success: boolean; method: 'share' | 'download'; message: string }> {
    if (batches.length === 0) {
        return { success: false, method: 'download', message: 'Tidak ada data batch untuk di-export' };
    }
    
    // Filter to only completed batches
    const completedBatches = batches.filter(b => b.status === 'done');
    
    if (completedBatches.length === 0) {
        return { success: false, method: 'download', message: 'Tidak ada batch yang sudah selesai' };
    }
    
    const csvContent = generateCSVContent(completedBatches, userName);
    const sanitizedName = sanitizeName(userName);
    const filename = `Laporan_${sanitizedName}_${getFilenameDate()}.csv`;
    
    // Try native share API first
    if (navigator.share && navigator.canShare) {
        try {
            const file = new File([csvContent], filename, { type: 'text/csv' });
            
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Laporan Produksi VICO',
                    text: `Laporan produksi VCO - ${completedBatches.length} batch`,
                    files: [file]
                });
                return { 
                    success: true, 
                    method: 'share', 
                    message: `Berhasil membagikan ${completedBatches.length} batch` 
                };
            }
        } catch (error) {
            // Share cancelled or failed - fall through to download
            if ((error as Error).name === 'AbortError') {
                return { success: false, method: 'share', message: 'Berbagi dibatalkan' };
            }
        }
    }
    
    // Fallback: DOM download
    try {
        downloadCSVFile(csvContent, filename);
        return { 
            success: true, 
            method: 'download', 
            message: `File ${filename} berhasil diunduh (${completedBatches.length} batch)` 
        };
    } catch (error) {
        console.error('Failed to download CSV:', error);
        return { success: false, method: 'download', message: 'Gagal mengunduh file' };
    }
}

export default { shareBatchReport };
