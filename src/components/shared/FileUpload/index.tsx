// adapted from https://medium.com/@dprincecoder/creating-a-drag-and-drop-file-upload-component-in-react-a-step-by-step-guide-4d93b6cc21e0
import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import Button from '../Button';
import { SIZE_S } from '../iconSizes';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiCloudArrowUpOutline } from '@mdi/js';
import clsx from 'clsx';

interface Props {
    onFilesSelected: (files: File[]) => void;
    width: string;
    height: string;
    className?: string;
}

const FileUpload = (props: Props) => {
    const [files, setFiles] = useState<File[]>([]);
    const { onFilesSelected, width, height } = props;

    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const selectedFiles = event.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            const newFiles = Array.from(selectedFiles);
            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
    };
    const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles.length > 0) {
            const newFiles = Array.from(droppedFiles);
            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    useEffect(() => {
        onFilesSelected(files);
    }, [files, onFilesSelected]);

    return (
        <section className={clsx(styles.dragDrop)} style={{ width: width, height: height }}>
            <div
                className={clsx(styles.documentUploader, styles.uploadBox, files.length > 0 && styles.active)}
                onDrop={handleDrop}
                onDragOver={(event) => event.preventDefault()}
            >
                <>
                    <div className={clsx(styles.uploadInfo)}>
                        {/* <AiOutlineCloudUpload /> */}
                        <Icon path={mdiCloudArrowUpOutline} size={1} color="#6DC24B" />
                        <div>
                            <p>Drag and drop your files here</p>
                            <p>Limit 15MB per file. Supported files: .PDF, .DOCX, .PPTX, .TXT, .XLSX</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        hidden
                        id="browse"
                        onChange={handleFileChange}
                        accept=".pdf,.docx,.pptx,.txt,.xlsx"
                        multiple
                    />
                    <label htmlFor="browse" className={clsx(styles.browseBtn)}>
                        Browse files
                    </label>
                </>

                {files.length > 0 && (
                    <div className={clsx(styles.fileList)}>
                        <div className={clsx(styles.fileList__container)}>
                            {files.map((file, index) => (
                                <div className={clsx(styles.fileItem)} key={index}>
                                    <div className={clsx(styles.fileInfo)}>
                                        <p>{file.name}</p>
                                        {/* <p>{file.type}</p> */}
                                    </div>
                                    <div className={clsx(styles.fileActions)}>
                                        <Button
                                            icon="delete"
                                            onClick={() => handleRemoveFile(index)}
                                            color="red"
                                            size={SIZE_S}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {files.length > 0 && (
                    <div className={clsx(styles.successFile)}>
                        <Icon path={mdiCheckCircle} size={1} color="#6DC24B" />
                        <p>{files.length} file(s) selected</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FileUpload;
