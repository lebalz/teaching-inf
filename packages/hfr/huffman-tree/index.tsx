import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import TextAreaInput from '@tdev-components/shared/TextAreaInput';
import Card from '@tdev-components/shared/Card';
// @ts-ignore
import CodeBlock from '@theme/CodeBlock';

interface HuffmanNode {
    id: string;
    char?: string | null;
    freq: number;
    left?: HuffmanNode;
    right?: HuffmanNode;
    code?: string;
}

interface SimulationNode extends d3.SimulationNodeDatum {
    id: string;
    x?: number;
    y?: number;
    data: HuffmanNode;
}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
    source: SimulationNode | string;
    target: SimulationNode | string;
}

const encodeText = (text: string, tree?: HuffmanNode): string => {
    if (!text || !tree) {
        return '';
    }
    const charMap = new Map<string, string>();
    const encodeNode = (node: HuffmanNode, code: string) => {
        if (node.char) {
            charMap.set(node.char, code);
        } else if (node.left && node.right) {
            encodeNode(node.left, code + '0');
            encodeNode(node.right, code + '1');
        }
    };
    encodeNode(tree, '');
    return text
        .split('')
        .map((char) => charMap.get(char) || '')
        .join(' ');
};

const HuffmanTree: React.FC = () => {
    const [text, setText] = useState<string>('Huffman');
    const [encoded, setEncoded] = useState<string>('');
    const svgRef = useRef<SVGSVGElement>(null);
    const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationLink> | null>(null);

    // Calculate character frequencies
    const calculateFrequencies = (str: string): Map<string, number> => {
        const freqMap = new Map<string, number>();
        for (const char of str) {
            freqMap.set(char, (freqMap.get(char) || 0) + 1);
        }
        return freqMap;
    };

    // Generate unique IDs for nodes
    let nextId = 0;
    const getNextId = () => `node_${nextId++}`;

    // Build Huffman tree
    const buildHuffmanTree = (text: string): HuffmanNode | null => {
        if (!text) {
            return null;
        }
        nextId = 0; // Reset ID counter

        const freqMap = calculateFrequencies(text);
        if (freqMap.size === 0) {
            return null;
        }

        // Create leaf nodes
        let nodes: HuffmanNode[] = [];
        freqMap.forEach((freq, char) => {
            nodes.push({ id: getNextId(), char, freq });
        });

        // Handle special case: only one unique character
        if (nodes.length === 1) {
            return {
                id: getNextId(),
                freq: nodes[0].freq,
                left: { id: getNextId(), char: nodes[0].char, freq: nodes[0].freq },
                right: { id: getNextId(), char: null, freq: 0 }
            };
        }

        // Sort nodes by frequency (ascending) and then by character (alphabetically)
        const compareNodes = (a: HuffmanNode, b: HuffmanNode): number => {
            if (a.freq === b.freq) {
                return (a.char || '') < (b.char || '') ? -1 : 1;
            }
            return a.freq - b.freq;
        };

        nodes.sort(compareNodes);

        // Build the tree
        while (nodes.length > 1) {
            // Always take the two nodes with the lowest frequency
            const left = nodes.shift()!;
            const right = nodes.shift()!;

            // Create a new internal node with these two nodes as children
            const parent: HuffmanNode = {
                id: getNextId(),
                freq: left.freq + right.freq,
                left,
                right
            };

            // Insert the new node in the correct position to maintain sorting
            let insertIndex = 0;
            while (insertIndex < nodes.length && compareNodes(nodes[insertIndex], parent) < 0) {
                insertIndex++;
            }

            nodes.splice(insertIndex, 0, parent);
        }

        return nodes.length > 0 ? nodes[0] : null;
    };

    // Assign codes to each node
    const assignCodes = (node: HuffmanNode | null, code: string = ''): void => {
        if (!node) return;

        node.code = code;

        if (node.left) {
            assignCodes(node.left, code + '0');
        }
        if (node.right) {
            assignCodes(node.right, code + '1');
        }
    };

    const renderTree = (root: HuffmanNode | null) => {
        const width = 800;
        const height = 500;
        const nodeRadius = 20;
        const padding = 40; // Padding around the tree
        const offsetX = 0;
        const heightScale = 1.5;

        if (!svgRef.current || !root) {
            d3.select(svgRef.current).selectAll('*').remove();
            return;
        }

        // Clear previous SVG content
        d3.select(svgRef.current).selectAll('*').remove();

        // Create SVG and groups
        const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

        const g = svg.append('g');

        // Add zoom functionality
        const zoom = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // Convert Huffman tree to D3 hierarchy
        const rootHierarchy = d3.hierarchy(root, (d) => {
            const children = [];
            if (d.left) children.push(d.left);
            if (d.right) children.push(d.right);
            return children;
        });

        // Generate tree layout
        const treeLayout = d3
            .tree<HuffmanNode>()
            .nodeSize([60, 150]) // Control vertical and horizontal spacing
            .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

        treeLayout(rootHierarchy);

        // Get all nodes and calculate bounds
        const descendants = rootHierarchy.descendants();
        const xExtent = d3.extent(descendants, (d) => d.x) as [number, number];
        const yExtent = d3.extent(descendants, (d) => d.y) as [number, number];

        // Calculate required scaling
        const boundsWidth = xExtent[1] - xExtent[0];
        const boundsHeight = yExtent[1] - yExtent[0];
        const scale = Math.min((width - padding * 2) / boundsWidth, (height - padding * 2) / boundsHeight);

        // Calculate translation to center the tree
        const tx = (width - boundsWidth * scale) / 2 - xExtent[0] * scale + padding / 2;
        const ty = (height - boundsHeight * scale) / 2 - yExtent[0] * scale + padding / 2;

        // Apply initial transform
        g.attr('transform', `translate(${tx},${ty}) scale(${scale})`);

        // Draw links
        const links = g
            .selectAll('.link')
            .data(rootHierarchy.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr(
                'd',
                (d3 as any)
                    .linkVertical()
                    .x((d: any) => d.x - offsetX)
                    .y((d: any) => d.y / heightScale)
            )
            .attr('fill', 'none')
            .attr('stroke', '#999')
            .attr('stroke-width', 2);

        // Draw nodes
        const nodes = g
            .selectAll('.node')
            .data(descendants)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', (d) => `translate(${(d.x || 0) - offsetX},${(d.y || 0) / heightScale})`);

        // Add circles
        nodes
            .append('circle')
            .attr('r', nodeRadius)
            .attr('fill', (d) => (d.data.char !== undefined ? '#e6f3ff' : '#fff'))
            .attr('stroke', (d) => (d.data.char !== undefined ? '#4da6ff' : '#999'))
            .attr('stroke-width', 2);

        // Add frequency labels
        nodes
            .append('text')
            .attr('dy', '.35em')
            .attr('text-anchor', 'middle')
            .text((d) => d.data.freq)
            .attr('font-size', '10px');

        // Add character labels
        nodes
            .filter((d) => d.data.char !== undefined)
            .append('text')
            .attr('dy', nodeRadius + 10)
            .attr('text-anchor', 'middle')
            .text((d: any) => {
                const char = d.data.char;
                return char === ' ' ? '␣' : char === '\n' ? '↵' : char === '\t' ? '→' : char;
            })
            .attr('font-size', '12px')
            .attr('font-weight', 'bold');

        // Add code labels (0/1) on links
        g.selectAll('.link-label')
            .data(rootHierarchy.links())
            .enter()
            .append('text')
            .attr('class', 'link-label')
            .attr('x', (d: any) => (d.source.x + d.target.x) / 2 - offsetX)
            .attr('y', (d: any) => (d.source.y + d.target.y) / 2 / heightScale)
            .attr('text-anchor', 'middle')
            .attr('dx', (d: any) => (d.target.data.code?.slice(-1) === '1' ? 5 : -5))
            .text((d) => d.target.data.code?.slice(-1) || '')
            .attr('font-size', '12px')
            .attr('fill', '#666');
    };

    useEffect(() => {
        if (!text) {
            return;
        }
        const huffmanTree = buildHuffmanTree(text);
        if (!huffmanTree) {
            return;
        }
        setEncoded(encodeText(text, huffmanTree));
        assignCodes(huffmanTree);
        renderTree(huffmanTree);

        // Cleanup function
        return () => {
            if (simulationRef.current) {
                simulationRef.current.stop();
            }
        };
    }, [text]);

    return (
        <Card
            header={<h4>Huffman Baum Generator</h4>}
            footer={
                <CodeBlock language="plaintext" showLineNumbers={false}>
                    {encoded}
                </CodeBlock>
            }
            style={{ marginBottom: '1rem' }}
        >
            <TextAreaInput
                defaultValue={'Huffman'}
                onChange={setText}
                placeholder="Gib einen beliebigen Text ein..."
                minRows={5}
            />
            <div
                style={{
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}
            >
                <svg
                    ref={svgRef}
                    style={{
                        width: '100%',
                        height: '500px',
                        maxHeight: '60vh',
                        cursor: 'grab'
                    }}
                ></svg>
            </div>
        </Card>
    );
};

export default HuffmanTree;
