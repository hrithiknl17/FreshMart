import React from 'react';

interface LandingPageProps {
  onSignIn: () => void;
}

export default function LandingPage({ onSignIn }: LandingPageProps) {
  return (
    <div className="bg-background text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen overflow-y-auto">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
        <div className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
          <div className="text-2xl font-bold tracking-tight text-[#4900e5]">RIMS</div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-[#4900e5] font-bold border-b-2 border-[#4900e5] pb-1 font-body text-[0.875rem]" href="#">Inventory</a>
            <a className="text-on-surface-variant hover:text-[#4900e5] transition-colors font-body text-[0.875rem]" href="#">Procurement</a>
            <a className="text-on-surface-variant hover:text-[#4900e5] transition-colors font-body text-[0.875rem]" href="#">Chatbot</a>
            <a className="text-on-surface-variant hover:text-[#4900e5] transition-colors font-body text-[0.875rem]" href="#">Resources</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onSignIn} className="bg-gradient-to-br from-[#4900e5] to-[#6236ff] text-on-primary px-6 py-2.5 rounded-full font-bold hover:opacity-80 transition-all duration-200 scale-95 active:scale-90 font-body text-[0.875rem]">Sign In</button>
          </div>
        </div>
      </nav>
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative px-8 py-24 md:py-32 max-w-7xl mx-auto overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <span className="inline-block px-4 py-1.5 mb-6 text-[0.6875rem] font-bold uppercase tracking-[0.05em] bg-primary-fixed text-on-primary-fixed rounded-full">Future of Retail</span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] font-headline">Manage your store <br /><span className="text-primary">like a pro</span></h1>
              <p className="text-lg md:text-xl text-on-surface-variant mb-10 max-w-xl leading-relaxed">
                Track every item from shelf to sale. Know what's in stock, where it sits, and what's moving. Built for grocery stores that need to know their inventory cold.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={onSignIn} className="bg-gradient-to-br from-[#4900e5] to-[#6236ff] text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-xl shadow-primary/20">Sign In</button>
                <button className="bg-surface-container-highest text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-container-high transition-all">Learn more</button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10"></div>
              <div className="bg-surface-container-lowest rounded-2xl shadow-2xl p-4 transform rotate-2">
                <img alt="Modern, well-organized supermarket aisle" className="rounded-xl w-full h-[500px] object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_OJi9Pc1KOM8UMCJY6MAJRDjYVAVxcyF4ZpG6RTmMK3YRKe_z2SV5JfxpMLYeyHFsn63f-p-VFsNHZ8lbVZ-mFkIapQX5p3sAb2SJ9jcip4BMYKJJBTO1464bj7g7W8fbZO-vOn9Myp4-Zt8uHDmnmxLghDzUzZSH4wo5zgBQFZM1JemY_pg6lZjoMj8pZcTiajPHBqXQnm5Cuy7iFnsI2v8zggkYlwiEOmxejgCvz_hEIHDT0xfjDO9CmPWc3cIEFUTltzVMF8A" />
              </div>
            </div>
          </div>
        </section>
        {/* Core Pillars */}
        <section className="bg-surface-container-low py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-headline">Core Infrastructure</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto">Precision tools designed for the modern grocer's daily operations.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-surface-container-lowest p-10 rounded-2xl hover:translate-y-[-4px] transition-transform duration-300">
                <div className="w-14 h-14 bg-primary-fixed rounded-2xl flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 font-headline">Inventory</h3>
                <p className="text-on-surface-variant leading-relaxed">Track items across every aisle with real-time accuracy and automated stock alerts.</p>
              </div>
              <div className="bg-surface-container-lowest p-10 rounded-2xl hover:translate-y-[-4px] transition-transform duration-300">
                <div className="w-14 h-14 bg-secondary-fixed rounded-2xl flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-secondary text-3xl">shopping_cart_checkout</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 font-headline">Procurement</h3>
                <p className="text-on-surface-variant leading-relaxed">Manage orders from suppliers seamlessly. Predictive ordering ensures you never run out.</p>
              </div>
              <div className="bg-surface-container-lowest p-10 rounded-2xl hover:translate-y-[-4px] transition-transform duration-300">
                <div className="w-14 h-14 bg-tertiary-fixed rounded-2xl flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-tertiary text-3xl">location_on</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 font-headline">Locator</h3>
                <p className="text-on-surface-variant leading-relaxed">Help customers find items in seconds. Interactive maps guide them straight to the shelf.</p>
              </div>
            </div>
          </div>
        </section>
        {/* AI Assistant Showcase */}
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-16 border border-outline-variant/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-primary font-bold text-sm tracking-widest uppercase mb-4 block">Intelligence Integrated</span>
                <h2 className="text-4xl md:text-5xl font-bold mb-8 font-headline">Meet your new <br />AI co-pilot</h2>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 font-headline">For Admins</h4>
                      <p className="text-on-surface-variant">Instant reports on sales velocity, stock levels, and predictive procurement advice via natural language.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-tertiary flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-xl">person</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 font-headline">For Customers</h4>
                      <p className="text-on-surface-variant">"Where can I find organic soy milk?" – The AI provides precise aisle and shelf coordinates instantly.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-surface-container shadow-inner rounded-3xl p-6 md:p-10 border border-outline-variant/30">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl rounded-bl-none max-w-[80%] shadow-sm">
                    <p className="text-sm font-medium">Hello! How can I help you manage the store today?</p>
                  </div>
                  <div className="bg-primary text-white p-4 rounded-2xl rounded-br-none max-w-[80%] ml-auto shadow-md">
                    <p className="text-sm">Which aisles have stock levels below 15%?</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-bl-none max-w-[80%] shadow-sm">
                    <p className="text-sm">Aisles 4 (Dairy) and 7 (Snacks) are currently below 15%. Would you like me to draft a restock order for our main supplier?</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Statistics Section */}
        <section className="bg-primary-container text-on-primary-container py-20 px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-6xl font-extrabold mb-2 font-headline">85%</div>
              <p className="text-on-primary-container/80 font-medium uppercase tracking-widest text-xs">Customer satisfaction</p>
            </div>
            <div>
              <div className="text-6xl font-extrabold mb-2 font-headline">40%</div>
              <p className="text-on-primary-container/80 font-medium uppercase tracking-widest text-xs">Less inventory loss</p>
            </div>
            <div>
              <div className="text-6xl font-extrabold mb-2 font-headline">3x</div>
              <p className="text-on-primary-container/80 font-medium uppercase tracking-widest text-xs">Faster order processing</p>
            </div>
          </div>
        </section>
        {/* Process Section */}
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4 font-headline">How it Works</h2>
            <p className="text-on-surface-variant">Simplifying retail complexity in three steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-outline-variant/30 -z-10"></div>
            <div className="bg-surface p-8 text-center">
              <div className="w-16 h-16 bg-white shadow-lg rounded-full flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-8 border border-outline-variant/10">1</div>
              <h3 className="text-xl font-bold mb-4 font-headline">Stock Items</h3>
              <p className="text-on-surface-variant">Log inventory into our system with ease using mobile scanning or bulk uploads.</p>
            </div>
            <div className="bg-surface p-8 text-center">
              <div className="w-16 h-16 bg-white shadow-lg rounded-full flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-8 border border-outline-variant/10">2</div>
              <h3 className="text-xl font-bold mb-4 font-headline">Find Items</h3>
              <p className="text-on-surface-variant">Utilize our locator map to help staff and customers find exactly what they need.</p>
            </div>
            <div className="bg-surface p-8 text-center">
              <div className="w-16 h-16 bg-white shadow-lg rounded-full flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-8 border border-outline-variant/10">3</div>
              <h3 className="text-xl font-bold mb-4 font-headline">Procurement</h3>
              <p className="text-on-surface-variant">Automated insights alert you when it's time to reorder from your trusted suppliers.</p>
            </div>
          </div>
        </section>
        {/* Advantage Section (Bento Style) */}
        <section className="bg-surface-container-low py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 grid-rows-2 gap-6 h-[600px]">
              <div className="md:col-span-2 bg-surface-container-lowest rounded-3xl p-10 flex flex-col justify-end relative overflow-hidden">
                <img alt="Fresh Produce" className="absolute inset-0 w-full h-full object-cover opacity-10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATeDEYVY1mujR9PuCSBmgUIVsipEE46XImkntwfwcZ8UBVljHfkX5ujOI6nb6hj-Be9H1yxlYln9vyHWKnmK2x6dnST3m2HanyBcR_CPKu9-GGq58aZ_5ohbflFHcGkVSWDlTm4a9vk-BtzlgmL1Ybda3TtX7Q9Chh7FNAdI0XdU6YYxFdTuG63ZLhJkgaqJov1W1jK_Z-ICu-oSM9rR2qaaOuZI-zfFInkvs4bvTW9LOXtQRKyzCe9GBcBMHcaNm_45rG2MonKak" />
                <div className="relative z-10">
                  <h3 className="text-4xl font-bold mb-4 font-headline">Less waste.</h3>
                  <p className="text-on-surface-variant text-lg">Our predictive engine tracks expiration dates and sales velocity to ensure your shelves are always fresh.</p>
                </div>
              </div>
              <div className="bg-primary rounded-3xl p-10 flex flex-col justify-between text-white">
                <span className="material-symbols-outlined text-4xl">speed</span>
                <div>
                  <h3 className="text-3xl font-bold mb-2 font-headline">Faster restocking.</h3>
                  <p className="text-white/80">Cut down restocking time by 45% with intelligent route planning for staff.</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest rounded-3xl p-10 flex flex-col justify-between border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-4xl">trending_up</span>
                <div>
                  <h3 className="text-3xl font-bold mb-2 font-headline">Better sales.</h3>
                  <p className="text-on-surface-variant">Data-driven placements ensure high-margin items get the visibility they deserve.</p>
                </div>
              </div>
              <div className="md:col-span-2 bg-surface-container-lowest rounded-3xl p-10 flex items-center gap-12 border border-outline-variant/20">
                <div className="flex -space-x-4">
                  <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden">
                    <img alt="User 1" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyJbO-tLnn8sE8_bGuHkzrs7R7Rm3uFtQhq-ApoyPY8lojKIWGRqfkC4e3GQKppROE7ut8PYyy8djxRuDZmZ1UqMhaW_fdiMvxT8cqHSDppY_Wuq93LkOiTef81gF2jemolL4T7Wn6fz1IPDz8ByIVaApjfqb96Xlm2JaQju7Z6TPL5uXQF3el8ACMb67FI2rEbea31TAPdGCv8BuXrJQX7PVNpFRd8BUTHme4PkRRMMzqbalJbAH0tyIFj-wzBFWZ3gQWw-PUyU8" />
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden">
                    <img alt="User 2" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBq1LHShz8PLoBIGSYxnOic5HU3O1yKIXoQkHfwDZSd4BsaYx9HHosUbX4RU6wRLwXmIdvfIRlCnUI99_xWZmzOC4FoF9MiBrLViJSF3icf8IaX_CXI_Lpw64x09psKlkb744FMZannS3txaRwp8XfUBddGxvGBPukVWQzdZVUaFoJ3b8GNuFyjVgwAiGAUC5PBgV6ApeUH0I1qiDE4F7paldyvi_mBj28-4zwj-g5VaQDg3QkaA1haNW51ZmG6QHuZRYb6NG0enPw" />
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-primary flex items-center justify-center text-white font-bold">+2k</div>
                </div>
                <div>
                  <h4 className="text-xl font-bold font-headline">Trusted by 2,000+ stores</h4>
                  <p className="text-on-surface-variant">From local markets to national chains.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Testimonials */}
        <section className="py-24 px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-headline">Real Voices</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col justify-between">
              <p className="text-lg italic mb-8">"RIMS changed how we handle morning deliveries. I know exactly what’s missing before the trucks even arrive."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-dim overflow-hidden">
                  <img alt="Marcus Chen" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEeEq_90Q0YvwM7MnlSrX69CGK96lkmP8Fy1HF3z0XPRoUTyZuTTW-PaHUyEXebF60KjESJn_xt2VlnZrUvqtrnhuIF7CTkJZhmowAo-ULEAwhulRR6Ii28HuREcp91mWaS1Ys8AomkWMp6UvoTYXyWmXjTaBjganuzpU2nrfJIUj3GGaZZwjtTOPXnRezGXXqlvShbO9QfFCenx3ONC0VLTl87vqwH6z4dB0SwoXuFETnuJc7MvT-RfQClrO4hXmQoK-1XvPlx2U" />
                </div>
                <div>
                  <p className="font-bold">Marcus Chen</p>
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter">Store Manager</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col justify-between">
              <p className="text-lg italic mb-8">"I used to spend 15 minutes looking for specific gluten-free items. Now the store app tells me exactly where they are."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-dim overflow-hidden">
                  <img alt="Sarah Williams" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnn_AUl1qPOqyNJwd9Cx_j3giq_Z3Jx7iFMRdWQiSRdjggxoAcEmNW_dhMdwQ3JvbTJCP1fM1rC3fGL2v2qcAcyxfI_4Qf5d0oJbimUyaxXz3rTIXScRpUDivzYMa2qUjdH8FaBGs0pWz1PSmzp24tTenOVDGIpbr6htcBfBC-zriBjOzWr0GDQJyYFjEJ9hsJZfDtWpbbMnnAz4om_Nn-KC_lBY2-VlkCZc_zfjo3AUrbxD3qHlz9n8gs9vPk7WaT68bATwNaLd8" />
                </div>
                <div>
                  <p className="font-bold">Sarah Williams</p>
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter">Customer</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-8 rounded-2xl flex flex-col justify-between">
              <p className="text-lg italic mb-8">"The procurement automation is a lifesaver. Inventory loss is down significantly since we started using the AI assistant."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-dim overflow-hidden">
                  <img alt="James Rodriguez" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1b84XvEMWVmrZDEA4QmrzbcnvDZHByrv5Eg5daO__yf_U0scUrsKIOU3zz0G26u8I80_taXaZe3dfD-VvbS5NwHKi6r-m157MpJBKyNqo-2c_NRmOl8H0U8lYxhLtIAJuqvLTNb2eDNxYgDQLssiTmpyGYSxFdkN3SFIWaawh0qOHAEln9gY3wOr6kRUvw6jCHySp6o64Z1sqO9mmnrQE596X0KYOLFzIpkqSi1hWfJLPsEN24ZVAjojhPhEX1kcZDJB0szjP4m8" />
                </div>
                <div>
                  <p className="font-bold">James Rodriguez</p>
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter">Inventory Supervisor</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* FAQ Section */}
        <section className="bg-surface-container-low py-24 px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center font-headline">Common Questions</h2>
            <div className="space-y-4">
              <details className="group bg-surface-container-lowest rounded-2xl p-6 transition-all">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-lg list-none">
                  How does the tracking work?
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <p className="mt-4 text-on-surface-variant leading-relaxed">RIMS uses a combination of mobile scanning, RFID compatibility, and real-time sales data to maintain a live digital twin of your physical inventory across all aisles and stockrooms.</p>
              </details>
              <details className="group bg-surface-container-lowest rounded-2xl p-6 transition-all">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-lg list-none">
                  Can customers really find items fast?
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <p className="mt-4 text-on-surface-variant leading-relaxed">Yes. Through our customer-facing interface or the integrated store app, users can type in any product name and receive an interactive map pinpointing the exact shelf location.</p>
              </details>
              <details className="group bg-surface-container-lowest rounded-2xl p-6 transition-all">
                <summary className="flex justify-between items-center cursor-pointer font-bold text-lg list-none">
                  Does it integrate with my existing suppliers?
                  <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <p className="mt-4 text-on-surface-variant leading-relaxed">Absolutely. RIMS supports standard procurement protocols and can be configured to automatically send purchase orders to your vendors based on preset inventory thresholds.</p>
              </details>
            </div>
          </div>
        </section>
        {/* Final CTA Section */}
        <section className="py-24 px-8 text-center">
          <div className="max-w-4xl mx-auto bg-surface-container-lowest rounded-[3rem] p-16 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-br from-[#4900e5] to-[#6236ff]"></div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight font-headline">Ready to run your store better?</h2>
            <p className="text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto">See how RIMS transforms inventory management from a headache into your store's greatest advantage.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <button onClick={onSignIn} className="bg-gradient-to-br from-[#4900e5] to-[#6236ff] text-on-primary px-10 py-5 rounded-2xl font-bold text-xl hover:shadow-xl hover:scale-105 transition-all">Sign In to Continue</button>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-[#f3f4f5] pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 px-8 max-w-7xl mx-auto">
          <div className="col-span-2 lg:col-span-1">
            <div className="text-xl font-black text-[#4900e5] mb-6">RIMS</div>
            <p className="text-on-surface-variant text-sm leading-relaxed">Precision inventory management for the next generation of retail.</p>
          </div>
          <div>
            <h5 className="font-headline font-semibold text-sm mb-6 uppercase tracking-wider">Product</h5>
            <ul className="space-y-4">
              <li><a className="text-on-surface-variant hover:text-[#4900e5] transition-all hover:translate-x-1 inline-block" href="#">Inventory</a></li>
              <li><a className="text-on-surface-variant hover:text-[#4900e5] transition-all hover:translate-x-1 inline-block" href="#">Procurement</a></li>
              <li><a className="text-on-surface-variant hover:text-[#4900e5] transition-all hover:translate-x-1 inline-block" href="#">AI Assistant</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-headline font-semibold text-sm mb-6 uppercase tracking-wider">Company</h5>
            <ul className="space-y-4">
              <li><a className="text-on-surface-variant hover:text-[#4900e5] transition-all hover:translate-x-1 inline-block" href="#">About Us</a></li>
              <li><a className="text-on-surface-variant hover:text-[#4900e5] transition-all hover:translate-x-1 inline-block" href="#">Careers</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-headline font-semibold text-sm mb-6 uppercase tracking-wider">Legal</h5>
            <ul className="space-y-4">
              <li><a className="text-on-surface-variant hover:text-[#4900e5] transition-all hover:translate-x-1 inline-block" href="#">Privacy Policy</a></li>
              <li><a className="text-on-surface-variant hover:text-[#4900e5] transition-all hover:translate-x-1 inline-block" href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-outline-variant/20">
          <p className="text-on-surface-variant text-xs font-body">© 2024 RIMS Retail Inventory Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
