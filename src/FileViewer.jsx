import React, { useEffect, useState, useCallback } from "react";

import {
	axios,
	useAuth
} from './authorization/ocpRestClient';
import "./FileViewer.css";

const VIEWER_ID = "file-viewer-root";

function FileViewer({ closeDialog, publicationData}) {
  const [bravaApi, setBravaApi] = useState(null);
  const { authService } = useAuth();
  const publicationStatus = "Complete";

  const loadBravaViewer = useCallback(() => {
    axios
      .get(
        process.env.REACT_APP_BASE_URL + "/viewer/api/v1/viewers/brava-view-1.x/loader",
        {
          headers: {
            Authorization: `Bearer ${authService.getAuthTokens().access_token}`
          }
        }
      )
      .then((res) => {
        if (res.data) {
          const scriptEl = document.createElement("script");
          scriptEl.appendChild(document.createTextNode(res.data));
          document.getElementsByTagName("head")[0].appendChild(scriptEl);
        }
      });
  }, [authService]);

  useEffect(() => {
    window.addEventListener("bravaReady", function (event) {
        const currentOrigin = window.location.origin;
        if (event.origin && event.origin !== currentOrigin) {
          return;
        }
        if (event.target && event.target.origin === currentOrigin) {
          window.addEventListener(event["detail"] + "-close", function() {
            closeDialog();
          });
          setBravaApi(window[event["detail"]]);
        }
    });
    loadBravaViewer();
  }, [closeDialog, loadBravaViewer]);

  useEffect(() => {
    const toolbarWithMarkupStuff = {
      left: [
        { component: 'ToggleSidebarButton', side: 'tabContainerWithMarkups' },
        { component: 'DownloadButton' },
        { component: 'PanButton' },
        { component: 'ZoomToRectangleButton' },
        { component: 'SaveButton' },
        { component: 'ZoomInButton' },
        { component: 'ZoomOutButton' },
        { component: 'ZoomExtentsButton' },
        { component: 'ZoomWidthButton' },
        { component: 'RotateButton' },
      ],
      center: [{ component: 'TitleText' }],
      right: [
        { component: 'PageSelector', style: { marginLeft: '0.5em' } },
        { component: 'CloseButton', size: 18 }
      ]
    };
    
    const tabContainerWithMarkups = {
      sidebarName: 'tabContainerWithMarkups',
      primary: 'primary',
      tabs: [
        { component: 'ThumbnailPane', title: 'tab.thumbnails' },
        { component: 'MarkupPane', title: 'tab.markups', layoutKey: 'markupTools' },
      ]
    };
    
    const markupTools = [
      {
        title: 'Tools',
        tools: [
          {
            label: 'select markup',
            tool: 'select',
            icon: 'Select'
          }
        ]
      },
      {
        title: 'toolPalette.annotations',
        tools: [
          { label: 'text', tool: 'text', icon: 'Text', props: {} },
          { label: 'arrow', tool: 'arrow', icon: 'Arrow', props: {} },
          { label: 'ellipse', tool: 'ellipse', icon: 'Ellipse', props: {} },
          { label: 'arc', tool: 'arc', icon: 'Arc', props: {} },
          { label: 'scratchout', tool: 'scratchout', icon: 'Scratchout', props: {} },
          { label: 'cloudRectangle', tool: 'cloudRectangle', icon: 'CloudRectangle', props: {} },
          { label: 'cloudPolygon', tool: 'cloudPolygon', icon: 'CloudPolygon', props: {} },
          { label: 'openSketch', tool: 'openSketch', icon: 'OpenSketch' },
          { label: 'closedSketch', tool: 'closedSketch', icon: 'ClosedSketch' },
          { label: 'line', tool: 'line', icon: 'Line', props: {} },
          {
            label: 'polyline',
            tool: 'polyline',
            icon: 'Polyline',
            props: { closed: false }
          },
          { label: 'crossout', tool: 'crossout', icon: 'Crossout', props: {} },
          { label: 'rectangle', tool: 'rectangle', icon: 'Rectangle', props: {} },
          {
            label: 'polygon',
            tool: 'polygon',
            icon: 'Polygon',
            props: { closed: true }
          },
          {
            label: 'highlight',
            tool: 'highlight',
            icon: 'Highlight'
          },
          {
            label: 'roundedRectangle',
            tool: 'roundedRectangle',
            icon: 'RoundedRectangle'
          },
          {
            label: 'changemark',
            tool: 'changemark',
            icon: 'Changemark',
            props: { fill: '#f05822dd' } // OpenText "Burnt" color
          },
          {
            label: 'raster',
            tool: 'raster',
            icon: 'Raster'
          },
          {
            label: 'stamp',
            tool: 'stamp',
            icon: 'Stamp'
          }
        ]
      },
      {
        title: 'toolPalette.text',
        tools: [
          {
            label: 'textScratch',
            tool: 'textScratch',
            icon: 'TextScratchout'
          },
          {
            label: 'textUnderline',
            tool: 'textUnderline',
            icon: 'TextUnderline'
          },
          {
            label: 'textStrike',
            tool: 'textStrike',
            icon: 'TextStrikeThrough'
          },
          {
            label: 'textHighlight',
            tool: 'textHighlight',
            icon: 'TextHighlight'
          }
        ]
      },
      {
        title: 'toolPalette.redactions',
        tools: [
          {
            label: 'redactionRectangle',
            tool: 'redactionRectangle',
            icon: 'RedactArea'
          },
          {
            label: 'redactionText',
            tool: 'redactionText',
            icon: 'RedactText'
          },
          {
            label: 'peekRectangle',
            tool: 'peekRectangle',
            icon: 'RedactPeek'
          }
        ]
      }
    ];

    if (bravaApi) {
      bravaApi.setHttpHeaders({
          Authorization: `Bearer ${authService.getAuthTokens().access_token}`
      });
      bravaApi.setScreenBanner(
        "Viewer Service by OpenText | Document Viewed at %Time"
      );
      bravaApi.enableMarkup(true);
      bravaApi.editableMarkupPredicate = () => true;
      bravaApi.commentableMarkupPredicate = () => true;
      bravaApi.visibleToolPropertyPredicate = () => true;
      bravaApi.deletableMarkupPredicate = () => true;
      bravaApi.deletableStampPredicate = () => true;
      bravaApi.editableStampPredicate = () => true;
      bravaApi.addableStampPredicate = () => true;

      bravaApi.setMarkupHost(window.ViewerAuthority);
      bravaApi.setUserName(authService.getUser().preferred_username);
      bravaApi.setScreenWatermark("ORIGINAL");

      bravaApi.setLayout({
        topToolbar: 'toolbarWithMarkupStuff',
        toolbarWithMarkupStuff: toolbarWithMarkupStuff,
        mainContainer: [
          { component: 'TabContainer', layoutKey: 'tabContainerWithMarkups' },
          { component: 'PageContainer' }
        ],
        tabContainerWithMarkups: tabContainerWithMarkups,
        markupTools: markupTools
      });
      bravaApi.addPublication(publicationData, true);
      bravaApi.render(VIEWER_ID); 
    }
  }, [bravaApi, publicationData, authService]);

  if (publicationStatus !== "Complete") {
    return null;
  }

  return <div id={VIEWER_ID}></div>;
};

export default FileViewer;
