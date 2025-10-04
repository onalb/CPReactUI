import React from 'react';
import { ScrollOrZoomMode } from './constants';

interface HeaderProps {
  isHeaderOpened: boolean;
  isHeaderPinned: boolean;
  handleMouseEnterHeader: (e: any) => void;
  handleMouseLeaveHeader: (e: any) => void;
  handleHeaderHandleClick: (e: any) => void;
  scrollOrZoomMode: ScrollOrZoomMode;
  setScrollOrZoomMode: (mode: ScrollOrZoomMode) => void;
  isFilteredView: boolean;
  setIsFilteredView: (v: boolean) => void;
  filteredImageIds: number[];
  setFilteredImageIds: (ids: number[]) => void;
  isKeptFilteredView: boolean;
  setIsKeptFilteredView: (v: boolean) => void;
  keptFilteredImageIds: number[];
  setKeptFilteredImageIds: (ids: number[]) => void;
  isMarkedFilteredView: boolean;
  setIsMarkedFilteredView: (v: boolean) => void;
  markedFilteredImageIds: number[];
  setMarkedFilteredImageIds: (ids: number[]) => void;
  images: any[];
  selectedImageIds: number[];
  setSelectedImageIds: (ids: number[]) => void;
  setCurrentSelectedImage: (idx: number|null) => void;
  IconWithBadge: any;
  numberOfKeptImages: number;
  numberOfMarkedImages: number;
  openWithDialog: (path: string) => void;
  selectAllImages: () => void;
  handleDeleteSelectedImages: (e: any) => void;
  handleDeleteMarkedImages: () => void;
  setHandleDeleteImages: (fn: any) => void;
  setPopupOptions: (opts: any) => void;
  openGalleria: (e: any) => void;
  openKeptOnNewTab: (e: any) => void;
  toggleKeepPhotoMutation: any;
}

const Header: React.FC<HeaderProps> = (props) => (
  <div
    id='header'
    className={`header position-absolute vh-10 vw-100 top-0 start-0 d-flex flex-column justify-content-center align-items-center p-0 no-selection-removal-on-click ${props.isHeaderOpened ? 'header-opened' : ''}`}
    style={{
      backgroundColor: 'rgba(32, 32, 32, .98)',
      width: '100%',
      height: '100px',
      position: 'absolute',
      zIndex: 2,
      transition: 'transform 0.3s ease-in-out, background-color 0.3s ease',
      transform: props.isHeaderPinned ? 'translateY(0%)' : 'translateY(-100%)',
    }}
    onMouseEnter={props.handleMouseEnterHeader}
    onMouseLeave={props.handleMouseLeaveHeader}
    onTouchStart={props.isHeaderOpened ? props.handleMouseLeaveHeader : props.handleMouseEnterHeader}
  >
    <div
      className='header-handle no-selection-removal-on-click'
      onClick={props.handleHeaderHandleClick}
      onTouchEnd={props.handleHeaderHandleClick}
    >
      <i 
        className={`bi header-handle-icon no-selection-removal-on-click ${!props.isHeaderOpened ? 'bi-chevron-compact-down' : (props.isHeaderPinned ? 'bi-pin-angle-fill' : 'bi-pin-angle')}`}
      ></i>
    </div>
    <div className='row align-self-center w-100'>
      <div key='blank-col' className='col-1'></div>

      <div
        key='all-images'
        className='col-1 d-flex justify-content-center align-items-center no-selection-removal-on-click'>
        <div style={{ position: 'relative', display: 'inline-block' }} className='no-selection-removal-on-click'>
          <i
            className={`col bi bi-images no-selection-removal-on-click ${!props.isFilteredView && !props.isKeptFilteredView && !props.isMarkedFilteredView ? 'clicked-white' : ''}`}
            style={{        
              display: 'block', 
              fontSize: '45px', 
              color: !props.isFilteredView && !props.isKeptFilteredView && !props.isMarkedFilteredView ? '#ff9393ff' : 'white',
              transition: 'color 0.3s ease, background-color 0.3s ease',
              textAlign: 'left',
              cursor: 'pointer',
            }}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title={`${props.images.filter(img => !img.isDeleted).length} Total Images - Show all images`}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={() => {
              props.setIsFilteredView(false);
              props.setFilteredImageIds([]);
              props.setIsKeptFilteredView(false);
              props.setKeptFilteredImageIds([]);
              props.setIsMarkedFilteredView(false);
              props.setMarkedFilteredImageIds([]);
              const imagesContainer = document.querySelector('.images-container');
              if (imagesContainer) {
                imagesContainer.scrollTop = 0;
              }
            }}
            onTouchEnd={() => {
              props.setIsFilteredView(false);
              props.setFilteredImageIds([]);
              props.setIsKeptFilteredView(false);
              props.setKeptFilteredImageIds([]);
              props.setIsMarkedFilteredView(false);
              props.setMarkedFilteredImageIds([]);
              const imagesContainer = document.querySelector('.images-container');
              if (imagesContainer) {
                imagesContainer.scrollTop = 0;
              }
            }}
          ></i>
          <span style={{
            position: 'absolute',
            top: '15px',
            right: '0px',
            backgroundColor: '#FF6B6B',
            color: 'white',
            borderRadius: '50%',
            fontSize: '11px',
            fontWeight: 'bold',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            {props.images.filter(img => !img.isDeleted).length}
          </span>
        </div>
      </div>
      <div
        key='selected-count'
        className='col-1 d-flex justify-content-center align-items-center no-selection-removal-on-click'>
        <props.IconWithBadge
          iconClass="bi bi-hand-index"
          count={props.selectedImageIds.length}
          isActive={props.selectedImageIds.length > 0}
          isFilteredView={props.isFilteredView}
          title={`${props.selectedImageIds.length > 0 ? props.selectedImageIds.length + ' Selected - ' : ''}${props.isFilteredView ? 'Show all' : 'View selected only'}`}
          filteredIds={props.filteredImageIds}
          setFilteredIds={props.setFilteredImageIds}
          setIsFilteredView={props.setIsFilteredView}
          otherFilterStates={{
            setIsOtherFilteredView: props.setIsKeptFilteredView,
            setOtherFilteredIds: props.setKeptFilteredImageIds,
            setIsOtherFilteredView2: props.setIsMarkedFilteredView,
            setOtherFilteredIds2: props.setMarkedFilteredImageIds
          }}
          getIdsToFilter={() => props.selectedImageIds}
          filteredColorClass="clicked-blue"
          onKeepAll={() => {
            const selectedImages = props.images.filter(img => props.selectedImageIds.includes(img.id));
            selectedImages.forEach(image => {
              if (!image.isKept) {
                props.toggleKeepPhotoMutation.mutate(image);
              }
            });
          }}
          onUnkeepAll={() => {
            const selectedImages = props.images.filter(img => props.selectedImageIds.includes(img.id));
            selectedImages.forEach(image => {
              if (image.isKept) {
                props.toggleKeepPhotoMutation.mutate(image);
              }
            });
          }}
        />
      </div>
      <div
        key='kept-images'
        className='col-1 d-flex justify-content-center align-items-center no-selection-removal-on-click'>
        <props.IconWithBadge
          iconClass="bi bi-bag-check"
          count={props.numberOfKeptImages}
          isActive={props.numberOfKeptImages > 0}
          isFilteredView={props.isKeptFilteredView}
          title={`${props.numberOfKeptImages > 0 ? props.numberOfKeptImages + ' Kept - ' : ''}${props.isKeptFilteredView ? 'Show all' : 'View kept only'}`}
          filteredIds={props.keptFilteredImageIds}
          setFilteredIds={props.setKeptFilteredImageIds}
          setIsFilteredView={props.setIsKeptFilteredView}
          otherFilterStates={{
            setIsOtherFilteredView: props.setIsFilteredView,
            setOtherFilteredIds: props.setFilteredImageIds,
            setIsOtherFilteredView2: props.setIsMarkedFilteredView,
            setOtherFilteredIds2: props.setMarkedFilteredImageIds
          }}
          getIdsToFilter={() => props.images.filter(img => !img.isDeleted && img.isKept).map(img => img.id)}
          filteredColorClass="clicked-green"
          onEnterFilter={() => {
            props.setSelectedImageIds([]);
            props.setCurrentSelectedImage(null);
          }}
        />
      </div>
      <div
        key='marked-for-deletion'
        className='col-1 d-flex justify-content-center align-items-center no-selection-removal-on-click'>
        <props.IconWithBadge
          iconClass="bi bi-cart-x"
          count={props.numberOfMarkedImages}
          isActive={props.numberOfMarkedImages > 0}
          isFilteredView={props.isMarkedFilteredView}
          title={`${props.numberOfMarkedImages > 0 ? props.numberOfMarkedImages + ' Marked - ' : ''}${props.isMarkedFilteredView ? 'Show all' : 'View marked for deletion only'}`}
          filteredIds={props.markedFilteredImageIds}
          setFilteredIds={props.setMarkedFilteredImageIds}
          setIsFilteredView={props.setIsMarkedFilteredView}
          otherFilterStates={{
            setIsOtherFilteredView: props.setIsFilteredView,
            setOtherFilteredIds: props.setFilteredImageIds,
            setIsOtherFilteredView2: props.setIsKeptFilteredView,
            setOtherFilteredIds2: props.setKeptFilteredImageIds
          }}
          getIdsToFilter={() => props.images.filter(img => !img.isDeleted && img.isMarkedForDeletion).map(img => img.id)}
          filteredColorClass="clicked-orange"
          onEnterFilter={() => {
            props.setSelectedImageIds([]);
            props.setCurrentSelectedImage(null);
          }}
        />
      </div>
      <div
        key='select-all'
        className='col-1 d-flex justify-content-center align-items-center'>
        <i
          className={`col bi bi-share`}
          style={{        
            display: 'block', fontSize: '45px', color: 'white',
            transition: 'color 0.3s ease, background-color 0.3s ease',
            textAlign: 'left',
          }}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title='OPEN WITH'
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={() => props.openWithDialog('C:\\Users\\burak\\Pictures\\DSC04127.JPG')}
          onTouchEnd={() => props.openWithDialog('C:\\Users\\burak\\Pictures\\DSC04127.JPG')}
        ></i>
      </div>
      <div
        key='open-galleria'
        className='col-3 d-flex justify-content-center align-items-center'>
        <i
          className={`col bi bi-tv`}
          style={{        
            display: 'block', fontSize: '45px', color: 'white', padding: '0px',
            transition: 'color 0.3s ease, background-color 0.3s ease',
            textAlign: 'left',
          }}
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title='OPEN GALLERIA'
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={props.openGalleria}
          onTouchEnd={props.openGalleria}
        ></i>
      </div>
      <div 
        key='scroll-zoom-toggle'
        className='col-1 d-flex align-items-center no-selection-removal-on-click'>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className='no-selection-removal-on-click '>
          <span style={{ color: 'white', fontSize: '14px' }} className='no-selection-removal-on-click'>Scroll:</span>
          <label style={{ 
            position: 'relative', 
            display: 'inline-block', 
            width: '50px', 
            height: '24px',
            cursor: 'pointer'
          }} className='no-selection-removal-on-click'>
            <input
              type="checkbox"
              checked={props.scrollOrZoomMode === ScrollOrZoomMode.ZOOM}
              onChange={(e) => props.setScrollOrZoomMode(e.target.checked ? ScrollOrZoomMode.ZOOM : ScrollOrZoomMode.SCROLL)}
              style={{
                opacity: 0,
                width: 0,
                height: 0
              }}
              className='no-selection-removal-on-click'
            />
            <span style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: props.scrollOrZoomMode === ScrollOrZoomMode.ZOOM ? '#4CAF50' : '#ccc',
              borderRadius: '24px',
              transition: '0.3s',
              cursor: 'pointer'
            }} className='no-selection-removal-on-click'>
              <span style={{
                position: 'absolute',
                content: '""',
                height: '18px',
                width: '18px',
                left: props.scrollOrZoomMode === ScrollOrZoomMode.ZOOM ? '26px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: '0.3s',
                cursor: 'pointer'
              }} className='no-selection-removal-on-click'></span>
            </span>
          </label>
          <span style={{ color: 'white', fontSize: '12px' }} className='no-selection-removal-on-click'>
            {props.scrollOrZoomMode === ScrollOrZoomMode.ZOOM ? 'Zoom' : 'Pan'}
          </span>
        </div>
      </div>
      <div key='pin-header' className='col-2 d-flex align-items-center no-selection-removal-on-click'>
        <i
          className={`bi ${props.isHeaderPinned ? 'bi-pin-angle-fill' : 'bi-pin-angle'} header-pin-icon ml-1`}
          style={{ fontSize: '32px', color: props.isHeaderPinned ? '#4CAF50' : 'white', cursor: 'pointer', transition: 'color 0.3s' }}
          title={props.isHeaderPinned ? 'Unpin Header' : 'Pin Header'}
          onClick={props.handleHeaderHandleClick}
          onTouchEnd={props.handleHeaderHandleClick}
        ></i>
      </div>
    </div>
  </div>
);

export default Header;
