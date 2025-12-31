import { useRef, useLayoutEffect, useEffect, useState, useCallback } from "react";

export function useAutoScroll(messages: unknown[]) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const lastMessageCountRef = useRef(0);
    const userHasScrolledRef = useRef(false);
    const isScrollingProgrammaticallyRef = useRef(false);

    // Check if user is near the bottom of the scroll container
    const isNearBottom = useCallback(() => {
        const container = containerRef.current;
        if (!container) return true;
        
        const threshold = 150; // pixels from bottom - increased for better UX
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
        return isAtBottom;
    }, []);

    // Scroll to show the entire last message/card
    const scrollToBottom = useCallback((smooth = false, delay = 10) => {
        // Don't auto-scroll if user has manually scrolled up
        if (userHasScrolledRef.current && !isNearBottom()) {
            return;
        }

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            requestAnimationFrame(() => {
                if (messagesEndRef.current && containerRef.current) {
                    isScrollingProgrammaticallyRef.current = true;
                    
                    // Scroll to show the messagesEndRef with some padding
                    messagesEndRef.current.scrollIntoView({
                        behavior: smooth ? "smooth" : "auto",
                        block: "end",
                        inline: "nearest"
                    });

                    // Reset the programmatic scrolling flag after a short delay
                    setTimeout(() => {
                        isScrollingProgrammaticallyRef.current = false;
                    }, 100);
                }
            });
        }, delay);
    }, [isNearBottom]);

    // Track user scroll behavior
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let scrollTimeout: NodeJS.Timeout;
        
        const handleScroll = () => {
            // Ignore programmatic scrolls
            if (isScrollingProgrammaticallyRef.current) {
                return;
            }

            // Clear the previous timeout
            clearTimeout(scrollTimeout);

            // Set a timeout to check if user has stopped scrolling
            scrollTimeout = setTimeout(() => {
                const nearBottom = isNearBottom();
                
                // If user scrolled up significantly, mark it
                if (!nearBottom) {
                    userHasScrolledRef.current = true;
                } else {
                    // If they're back near the bottom, re-enable auto-scroll
                    userHasScrolledRef.current = false;
                }
            }, 150);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    // Scroll when new messages arrive
    useLayoutEffect(() => {
        const messageCount = Array.isArray(messages) ? messages.length : 0;
        const isNewMessage = messageCount > lastMessageCountRef.current;
        lastMessageCountRef.current = messageCount;

        if (isNewMessage) {
            // New message arrived, reset user scroll flag if they're near bottom
            if (isNearBottom()) {
                userHasScrolledRef.current = false;
            }
            // Use smooth scroll for new messages
            scrollToBottom(true, 0);
        }
    }, [messages, isNearBottom, scrollToBottom]);

    // Handle content mutations (streaming updates)
    useEffect(() => {
        let scrollScheduled = false;
        let animationFrameId: number | null = null;

        const observer = new MutationObserver(() => {
            if (!scrollScheduled && !userHasScrolledRef.current) {
                scrollScheduled = true;
                
                // Cancel any pending animation frame
                if (animationFrameId !== null) {
                    cancelAnimationFrame(animationFrameId);
                }

                // Schedule smooth scroll for streaming content
                animationFrameId = requestAnimationFrame(() => {
                    scrollToBottom(true, 20);
                    
                    // Reset the flag after a delay
                    setTimeout(() => {
                        scrollScheduled = false;
                        animationFrameId = null;
                    }, 100);
                });
            }
        });

        // Find the scroll container if not already set
        if (!containerRef.current && messagesEndRef.current) {
            let parent = messagesEndRef.current.parentElement;
            // Walk up the DOM tree to find the scrollable container
            while (parent) {
                const overflow = window.getComputedStyle(parent).overflowY;
                if (overflow === 'auto' || overflow === 'scroll') {
                    containerRef.current = parent as HTMLDivElement;
                    break;
                }
                parent = parent.parentElement;
            }
        }

        if (containerRef.current) {
            observer.observe(containerRef.current, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: false // Don't track attribute changes to reduce noise
            });
        }

        return () => {
            observer.disconnect();
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [messages.length, scrollToBottom]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    return {
        messagesEndRef,
        shouldAutoScroll,
        setShouldAutoScroll,
    };
}
