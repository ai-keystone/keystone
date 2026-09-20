export const ASSETS = {
    watermark:        "/images/keystone-line-art.png",
    icon:             "/images/keystone-logo-mark.svg",
    logoMark:         "/images/keystone-logo-mark.svg",
    logoPrimary:      "/images/keystone-logo-primary.svg",
    logoReverse:      "/images/keystone-logo-reverse.svg",
    qrCode:           "/images/qualtrics-qr.png",
    team:             { sujan: "/images/sujan.png", subrat: "/images/subrat.png", rhythm: "/images/rhythm.png" },
    phase1:           ["/images/1.jpg","/images/2.jpg","/images/3.jpg","/images/4.jpg","/images/5.jpg","/images/6.jpg"],
    phase2:           ["/images/7.jpeg","/images/8.jpeg","/images/9.jpeg","/images/10.jpeg","/images/11.jpeg","/images/12.jpeg","/images/13.jpeg","/images/14.jpeg"],
    phase3:           ["/images/15.jpeg","/images/6.jpg","/images/1.jpg","/images/4.jpg","/images/2.jpg","/images/5.jpg"],
    workflow:         {
        planReview:     "/images/b2b-plan-review.jpeg",
        firmLaunch:     "/images/b2b-firm-launch.jpeg",
        clientIntake:   "/images/b2b-client-intake.jpeg",
        planExport:     "/images/b2b-plan-export.jpeg",
        kickoffMeeting: "/images/b2b-kickoff-meeting.jpeg",
        collage:        "/images/b2b-workflow-collage.jpeg",
    },
    roadmap:          {
        exteriorStudy:  "/images/keystone_study_render.png",
        cadExport:      "/images/keystone_dx.png",
        overview:       "/images/roadmap-overview.jpeg",
    },
    /* The "rendered" presentation style - textured floors, furniture,
       material fills - is what the engine produces now. The older line
       drawings are kept because subpages still reference them. */
    /* Vector, not the raster. The PNG was 480 kB and its 20px sheet
       labels landed at roughly 9 CSS px once the 2400px export was
       downscaled into the hero, so they greyed out into mush. The same
       drawing as SVG is an eighth of the weight and stays sharp at every
       zoom level the viewer offers. */
    renderedPlan:      "/images/keystone_rendered_plan.svg",
    renderedElevations:"/images/keystone_rendered_elevations.png",
    exampleBlueprint: "/images/keystone_default_plan.png",
    exampleBlueprintVector: "/images/keystone_default_plan.svg",
    exampleElevationSheet: "/images/keystone_default_elevations.png",
    exampleRender:    "/images/keystone_study_render.png",
};
