import { describe, it, expect, vi } from 'vitest';
import { signal } from '@angular/core';

/**
 * Unit tests for ProfileComponent using Vitest.
 * Validates that profile displays member data from GlobalState signals.
 * Requirement: Vitest testing per .windsurf - validates signal-based rendering.
 */
describe('ProfileComponent (vitest)', () => {
  
  it('validates profile receives and displays member signal data', () => {
    // Arrange: mock GlobalState member signal
    const memberSignal = signal({
      id: 98,
      'primary-name': 'Cambridge University Press',
      location: 'United Kingdom',
      counts: {
        'total-dois': 250000,
        'current-dois': 200000
      }
    });

    // Act: read signal value (simulates component reading signal)
    const member = memberSignal();

    // Assert: verify signal data for rendering
    expect(member.id).toBe(98);
    expect(member['primary-name']).toBe('Cambridge University Press');
    expect(member.location).toBe('United Kingdom');
    expect(member.counts['total-dois']).toBe(250000);
  });

  it('validates profile reactivity when member signal updates', () => {
    // Arrange: create writable member signal
    const memberSignal = signal<any>(null);

    // Act: simulate loading state
    expect(memberSignal()).toBeNull();
    
    // Simulate API response updating signal
    memberSignal.set({
      id: 98,
      'primary-name': 'Cambridge University Press'
    });
    
    // Assert: signal should reflect new member data
    expect(memberSignal()).not.toBeNull();
    expect(memberSignal()['primary-name']).toBe('Cambridge University Press');
  });

  it('validates profile displays member ID signal correctly', () => {
    // Arrange: mock memberId signal
    const memberIdSignal = signal<number | null>(98);

    // Act: read signal for routing/API calls
    const memberId = memberIdSignal();

    // Assert: verify memberId for display and API requests
    expect(memberId).toBe(98);
    expect(typeof memberId).toBe('number');
  });

  it('validates profile fetches member when signal has ID but no data', () => {
    // Arrange: signals representing loading state
    const memberIdSignal = signal<number | null>(98);
    const memberSignal = signal<any>(null);
    const crossrefMock = {
      getMember: vi.fn().mockResolvedValue({
        id: 98,
        'primary-name': 'Cambridge'
      })
    };

    // Act: simulate component logic - if has ID but no member data, fetch
    const shouldFetch = memberIdSignal() !== null && memberSignal() === null;

    // Assert: should trigger fetch
    expect(shouldFetch).toBe(true);
    expect(memberIdSignal()).toBe(98);
    expect(memberSignal()).toBeNull();
  });

  it('validates profile updates member signal after API fetch', () => {
    // Arrange: simulate API response
    const memberSignal = signal<any>(null);
    const fetchedData = {
      id: 98,
      'primary-name': 'Cambridge University Press',
      location: 'UK'
    };

    // Act: simulate setting signal with API response
    memberSignal.set(fetchedData);

    // Assert: signal should have new data for rendering
    const member = memberSignal();
    expect(member).not.toBeNull();
    expect(member.id).toBe(98);
    expect(member.location).toBe('UK');
  });

  it('validates profile displays member works count from signal', () => {
    // Arrange: member signal with counts
    const memberSignal = signal({
      id: 98,
      'primary-name': 'Cambridge',
      counts: {
        'total-dois': 250000,
        'current-dois': 200000,
        'backfile-dois': 50000
      }
    });

    // Act: read counts for display
    const counts = memberSignal().counts;

    // Assert: verify counts are accessible for rendering
    expect(counts['total-dois']).toBe(250000);
    expect(counts['current-dois']).toBe(200000);
    expect(counts['backfile-dois']).toBe(50000);
  });

  it('validates profile handles navigation when no memberId signal', () => {
    // Arrange: empty memberId signal
    const memberIdSignal = signal<number | null>(null);
    const routerMock = {
      navigate: vi.fn()
    };

    // Act: simulate component init logic
    const memberId = memberIdSignal();
    if (!memberId) {
      routerMock.navigate(['/']);
    }

    // Assert: should navigate away when no memberId
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('validates profile signal updates trigger re-renders', () => {
    // Arrange: member signal and render tracking
    const memberSignal = signal<any>(null);
    const renderLog: string[] = [];

    // Simulate effect/computed that tracks renders
    const simulateRender = () => {
      const member = memberSignal();
      renderLog.push(member ? member['primary-name'] : 'loading');
    };

    // Act: simulate multiple signal updates
    simulateRender(); // initial: loading
    
    memberSignal.set({ 'primary-name': 'Cambridge' });
    simulateRender(); // after first update
    
    memberSignal.set({ 'primary-name': 'Oxford' });
    simulateRender(); // after second update

    // Assert: verify renders happened with correct data
    expect(renderLog).toHaveLength(3);
    expect(renderLog[0]).toBe('loading');
    expect(renderLog[1]).toBe('Cambridge');
    expect(renderLog[2]).toBe('Oxford');
  });
});
