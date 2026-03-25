import React from 'react';
import { observer } from 'mobx-react-lite';
import saveAs from '@tdev-components/util/saveAs';
import ExcelJS from 'exceljs';
import Decoder, { Measurement } from '../../models/Decoder';
import Button from '@tdev-components/shared/Button';
import { mdiFileExcel } from '@mdi/js';
import { SIZE_S } from '@tdev-components/shared/iconSizes';

export const exportNewPasswordList = async (labels: string[], data: Measurement[]) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = '@hfr/serial-plotter';
    workbook.lastModifiedBy = '@hfr/serial-plotter';
    workbook.created = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet('Messwerte');
    const headerRow = sheet.insertRow(1, ['Zeitstempel', ...labels]);
    headerRow.eachCell((cell) => {
        cell.font = {
            bold: true
        };
    });
    data.forEach((dataPoint, idx) => {
        const rowData = [dataPoint.timestamp, ...labels.map((label) => dataPoint[label])];
        sheet.insertRow(idx + 2, rowData);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const filename = `Messwerte-${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, filename);
};

interface Props {
    decoder: Decoder;
}

const ExcelExport = observer((props: Props) => {
    const { decoder } = props;
    return (
        <Button
            icon={mdiFileExcel}
            onClick={() => exportNewPasswordList(decoder.dataLabels, decoder.data)}
            text="Download"
            title="Alle Messwerte als Excel-Datei herunterladen."
            size={SIZE_S}
            iconSide="left"
            color="green"
        />
    );
});

export default ExcelExport;
