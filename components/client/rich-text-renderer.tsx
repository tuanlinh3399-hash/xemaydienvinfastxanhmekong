'use client';

import { useEffect, useRef } from 'react';

interface RichTextRendererProps {
    content: string;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = contentRef.current;
        if (!container) return;

        // Find all images inside the container
        const images = Array.from(container.querySelectorAll('img'));

        images.forEach((img) => {
            const styleAttr = img.getAttribute('style') || '';
            const isFloatLeft = styleAttr.includes('float: left') || img.style.float === 'left';
            const isFloatRight = styleAttr.includes('float: right') || img.style.float === 'right';

            if (isFloatLeft || isFloatRight) {
                // Find the direct child of the container that is or contains the image
                let rootNodeOfImg: Node | null = img;
                while (rootNodeOfImg && rootNodeOfImg.parentElement && rootNodeOfImg.parentElement !== container) {
                    rootNodeOfImg = rootNodeOfImg.parentElement;
                }

                if (!rootNodeOfImg) return;

                // Create two columns flex wrapper
                const wrapper = document.createElement('div');
                wrapper.className = 'flex flex-col md:flex-row gap-6 md:gap-8 items-start my-8 clear-both w-full';

                const col1 = document.createElement('div');
                col1.className = 'w-full md:w-[45%] shrink-0';
                if (isFloatRight) {
                    col1.className += ' md:order-last';
                }

                const col2 = document.createElement('div');
                col2.className = 'w-full md:w-[55%] flex flex-col gap-3';

                // Remove float style from image
                img.style.float = '';
                const cleanStyle = styleAttr.replace(/float\s*:\s*(left|right);?/g, '');
                img.setAttribute('style', cleanStyle);

                // Move any other elements inside rootNodeOfImg to col2
                if (rootNodeOfImg !== img) {
                    const p = document.createElement('p');
                    while (rootNodeOfImg.firstChild) {
                        const child = rootNodeOfImg.firstChild;
                        if (child === img || child.contains(img)) {
                            rootNodeOfImg.removeChild(child);
                        } else {
                            p.appendChild(child);
                        }
                    }
                    if (p.textContent?.trim() || p.children.length > 0) {
                        col2.appendChild(p);
                    }
                }

                // Collect next sibling nodes of rootNodeOfImg
                let nextSib = rootNodeOfImg.nextSibling;
                const siblingsToMove: Node[] = [];
                while (nextSib) {
                    const tagName = (nextSib as Element).tagName;
                    // Stop if we hit a heavy block element
                    if (tagName && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'IMG', 'TABLE', 'UL', 'OL', 'HR', 'IFRAME', 'BLOCKQUOTE'].includes(tagName.toUpperCase())) {
                        break;
                    }
                    // Stop if this element itself has a floated image inside
                    if (tagName && (nextSib as Element).querySelector('img[style*="float"]')) {
                        break;
                    }
                    siblingsToMove.push(nextSib);
                    nextSib = nextSib.nextSibling;
                }

                // Move siblings to col2
                siblingsToMove.forEach((sib) => {
                    col2.appendChild(sib);
                });

                // Assemble and replace rootNodeOfImg in DOM
                col1.appendChild(img);
                wrapper.appendChild(col1);
                wrapper.appendChild(col2);

                if (container.contains(rootNodeOfImg)) {
                    container.replaceChild(wrapper, rootNodeOfImg);
                }
            }
        });
    }, [content]);

    return (
        <div 
            ref={contentRef}
            className="prose prose-lg max-w-none mx-auto flow-root" 
            dangerouslySetInnerHTML={{ __html: content }} 
        />
    );
}
