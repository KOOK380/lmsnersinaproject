import React from "react";
import { motion } from "motion/react";

export interface TestimonialType {
  text: string;
  image: string;
  name: string;
  role: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: TestimonialType[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="p-10 rounded-3xl border shadow-lg shadow-primary/10 max-w-xs w-full bg-white" key={i}>
                  <div className="text-sm text-slate-700">{text}</div>
                  <div className="flex items-center gap-4 mt-5">
                    {image ? (
                        <img
                        width={40}
                        height={40}
                        src={image}
                        alt={name}
                        className="h-10 w-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">{name.charAt(0)}</div>
                    )}
                    <div className="flex flex-col">
                      <div className="font-bold tracking-tight leading-5 text-slate-900">{name}</div>
                      {role && <div className="leading-5 opacity-60 tracking-tight text-xs text-slate-500 uppercase">{role}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};
