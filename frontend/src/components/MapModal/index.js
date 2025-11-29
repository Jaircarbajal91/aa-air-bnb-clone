import React from 'react';
import { Modal } from '../../context/Modal';
import './MapModal.css';

function MapModal({ spot, onClose }) {
  if (!spot || !spot.lat || !spot.lng) {
    return null;
  }

  // Use Google Maps Embed - works without API key using the search URL
  // Format: lat,lng for coordinates
  const mapUrl = `https://www.google.com/maps?q=${spot.lat},${spot.lng}&output=embed&z=15`;

  return (
    <Modal onClose={onClose}>
      <div className="map-modal-container">
        <div className="map-modal-header">
          <h2 className="map-modal-title">Location</h2>
          <button className="map-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="map-modal-content">
          <div className="map-modal-address">
            <p className="map-address-text">
              <strong>{spot.address}</strong>
            </p>
            <p className="map-address-text">
              {spot.city}, {spot.state}, {spot.country}
            </p>
            <p className="map-coordinates">
              Coordinates: {spot.lat.toFixed(6)}, {spot.lng.toFixed(6)}
            </p>
          </div>
          <div className="map-modal-map">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            ></iframe>
          </div>
          <div className="map-modal-footer">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="map-modal-link"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default MapModal;

