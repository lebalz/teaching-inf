import StudentGroup from '@tdev-models/StudentGroup';
import ExcelJS from 'exceljs';
import siteConfig from '@generated/docusaurus.config';

export async function exportAsExcelSpreadsheet(group: StudentGroup) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = siteConfig.title;
    workbook.lastModifiedBy = siteConfig.title;
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet(group.name); // TODO: May need to sanitize this.

    // TODO: Filter cols?
    sheet.insertRow(1, ['ID', 'Vorname', 'Nachname']);

    group.students.forEach((student, index) => {
        sheet.insertRow(index + 2, [student.id, student.firstName, student.lastName]);
    });

    // TODO: Fit row width.

    const buffer = await workbook.xlsx.writeBuffer();

    // TODO: Factor out some parts as util.
    const downloadLink = document.createElement('a');
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${group.name} (${group.id}).xlsx`; // TODO: May need to sanitize this.
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}