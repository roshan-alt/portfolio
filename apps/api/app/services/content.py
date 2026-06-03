from sqlmodel import Session, select

from ..models import (
    BlogPost,
    Certification,
    Course,
    Education,
    Experience,
    Honor,
    Language,
    Profile,
    Project,
    Publication,
    Recommendation,
    Skill,
    Volunteer,
)


def public_bundle(session: Session) -> dict:
    profile = session.get(Profile, "profile")
    if not profile:
        profile = Profile(id="profile")

    def ordered(model):
        return session.exec(select(model).order_by(model.order)).all()

    return {
        "profile": profile,
        "experience": ordered(Experience),
        "education": ordered(Education),
        "skills": ordered(Skill),
        "projects": ordered(Project),
        "blog_posts": session.exec(
            select(BlogPost).where(BlogPost.published == True).order_by(BlogPost.order)
        ).all(),
        "certifications": ordered(Certification),
        "languages": ordered(Language),
        "volunteer": ordered(Volunteer),
        "honors": ordered(Honor),
        "publications": ordered(Publication),
        "courses": ordered(Course),
        "recommendations": ordered(Recommendation),
    }
